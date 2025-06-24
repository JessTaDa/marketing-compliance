from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    create_engine,
)
from sqlalchemy.orm import Session, declarative_base, relationship, sessionmaker
from sqlalchemy.sql.expression import func
from fastapi.middleware.cors import CORSMiddleware

# SQLAlchemy setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./newnorm.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class StatusEnum(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"


class NodeTypeEnum(str, Enum):
    SUB_CHECK = "SUB_CHECK"
    CHECK = "CHECK"
    ROOT = "ROOT"


class Node(Base):
    __tablename__ = "nodes"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    type = Column(String, index=True)
    name = Column(String)
    status = Column(String, nullable=True)
    reason = Column(String, nullable=True)
    parent_id = Column(Integer, ForeignKey("nodes.id"), nullable=True)
    children = relationship(
        "Node", back_populates="parent", cascade="all, delete-orphan"
    )
    parent = relationship("Node", back_populates="children", remote_side=[id])


class NodeStatusChange(Base):
    """Tracks each status change for a node, including old/new status and timestamp. Absolutely necessary for audit/history."""
    __tablename__ = "node_status_changes"
    id = Column(Integer, primary_key=True)
    node_id = Column(Integer, ForeignKey("nodes.id"), nullable=False)
    old_status = Column(String, nullable=True)
    new_status = Column(String, nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow)


# Create the database tables
Base.metadata.create_all(bind=engine)


app = FastAPI()

# Allow all origins for MVP testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NodeResponse(BaseModel):
    id: int = Field(..., description="The id of the node")
    type: NodeTypeEnum = Field(..., description="The type of the node")
    name: str = Field(..., description="The name of the node")
    status: Optional[StatusEnum] = Field(None, description="The status of the node")
    reason: Optional[str] = Field(None, description="The reason of the node")
    children: list[NodeResponse] = Field(
        default_factory=list, description="The children of the node"
    )

    class Config:
        extra = "forbid"

    @classmethod
    def from_orm(cls, node: Node) -> NodeResponse:
        return cls(
            id=node.id,
            type=node.type,
            name=node.name,
            status=node.status,
            reason=node.reason,
            children=[cls.from_orm(child) for child in node.children],
        )

# Convert JSON to Python objects
# Check if data types are correct
# Handle missing or invalid data
# Convert Python objects back to JSON
# Request model for override operation
class OverrideRequest(BaseModel):
    status: StatusEnum = Field(..., description="The new status to set")


# Helper function to determine if a node should be considered passing
def is_node_passing(node: Node) -> bool:
    """Determine if a node is passing based on its status and children"""
    if not node.children:  # Leaf node
        return node.status == StatusEnum.PASS
    else:  # Parent node - all children must pass
        return all(is_node_passing(child) for child in node.children)


# Helper function to update node status and propagate changes
def update_node_status(db: Session, node_id: int, new_status: StatusEnum) -> Node:
    """Update a node's status and propagate changes up the tree. Log each change for audit/history."""
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    old_status = node.status
    # Update the node's status
    node.status = new_status
    db.add(NodeStatusChange(node_id=node.id, old_status=old_status, new_status=new_status, changed_at=datetime.utcnow()))
    db.commit()
    # Propagate changes up the tree
    current = node.parent
    while current:
        should_pass = all(is_node_passing(child) for child in current.children)
        new_parent_status = StatusEnum.PASS if should_pass else StatusEnum.FAIL
        if current.status != new_parent_status:
            old_parent_status = current.status
            current.status = new_parent_status
            db.add(NodeStatusChange(node_id=current.id, old_status=old_parent_status, new_status=new_parent_status, changed_at=datetime.utcnow()))
            db.commit()
        current = current.parent
    return node


@app.get(
    "/",
    response_model=NodeResponse,
    summary="Norm Ai Interview Endpoint",
    description="Get a random root node and its children.",
    operation_id="getRandomNode",
)
def get_random_tree(db: Session = Depends(get_db)) -> NodeResponse:
    root_node = (
        db.query(Node)
        .filter(Node.type == NodeTypeEnum.ROOT)
        .order_by(func.random())
        .first()
    )

    if not root_node:
        raise HTTPException(
            status_code=404,
            detail="No root node found - perhaps the database isn't seeded?",
        )

    return NodeResponse.from_orm(root_node)


@app.post(
    "/override/{node_id}",
    response_model=NodeResponse,
    summary="Override Node Status",
    description="Override the status of a node and propagate changes up the tree.",
    operation_id="overrideNode",
)
def override_node_status(
    node_id: int, 
    override_request: OverrideRequest, 
    db: Session = Depends(get_db)
) -> NodeResponse:
    """Override a node's status and return the updated root node"""
    # Update the node and propagate changes
    updated_node = update_node_status(db, node_id, override_request.status)
    
    # Find and return the root node (the updated tree)
    root_node = updated_node
    while root_node.parent:
        root_node = root_node.parent
    
    return NodeResponse.from_orm(root_node)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
