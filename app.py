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

# SQLAlchemy setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./norm.db"
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

    __table_args__ = (
        CheckConstraint(status.in_([status.value for status in StatusEnum])),
        CheckConstraint(type.in_([type.value for type in NodeTypeEnum])),
    )


# Create the database tables
Base.metadata.create_all(bind=engine)


app = FastAPI()


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


NodeResponse.model_rebuild()


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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
