from sqlalchemy import Column, String, DateTime, Boolean, Float, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from db.database import Base


class User(Base):
    __tablename__ = "User"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    firstName: Mapped[str | None] = mapped_column(String, nullable=True)
    lastName: Mapped[str | None] = mapped_column(String, nullable=True)
    isAdmin: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    username: Mapped[str] = mapped_column(String, unique=True)
    password: Mapped[str] = mapped_column(String)
    roles = mapped_column(JSONB)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")


class Category(Base):
    __tablename__ = "Category"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    name: Mapped[str] = mapped_column(String)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "Product"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    categoryId: Mapped[str] = mapped_column(String, ForeignKey("Category.id"))
    colors = mapped_column(JSONB)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    description = mapped_column(JSONB)
    discountPrice: Mapped[float] = mapped_column(Float)
    images = mapped_column(JSONB)
    salePrice: Mapped[float] = mapped_column(Float)
    title: Mapped[str] = mapped_column(String)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    variants = mapped_column(JSONB)

    category = relationship("Category", back_populates="products")
    order = relationship("Order", secondary="_OrderToProduct", back_populates="products")
    reviews = relationship("Review", back_populates="product")
    comments = relationship("Comment", back_populates="product", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "Review"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    description: Mapped[str] = mapped_column(String)
    rating: Mapped[int] = mapped_column(Integer)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    productId: Mapped[str | None] = mapped_column(String, ForeignKey("Product.id"), nullable=True)
    userId: Mapped[str | None] = mapped_column(String, ForeignKey("User.id"), nullable=True)

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")


class Comment(Base):
    __tablename__ = "Comment"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    productId: Mapped[str] = mapped_column(String, ForeignKey("Product.id"))
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id"))
    content: Mapped[str] = mapped_column(String)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="comments")
    user = relationship("User")


class Order(Base):
    __tablename__ = "Order"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    paymentIntent: Mapped[str] = mapped_column(String)
    paymentStatus: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    price: Mapped[float] = mapped_column(Float)
    status = mapped_column(JSONB)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    userId: Mapped[str | None] = mapped_column(String, ForeignKey("User.id"), nullable=True)
    user = relationship("User", back_populates="orders")
    products = relationship("Product", secondary="_OrderToProduct", back_populates="order")


class SellerProfile(Base):
    __tablename__ = "SellerProfile"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id"), unique=True)
    displayName: Mapped[str] = mapped_column(String)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    products = relationship("SellerProduct", back_populates="seller")


class SellerProduct(Base):
    __tablename__ = "SellerProduct"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    sellerId: Mapped[str] = mapped_column(String, ForeignKey("SellerProfile.id"))
    productId: Mapped[str] = mapped_column(String, ForeignKey("Product.id"), unique=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    seller = relationship("SellerProfile", back_populates="products")
    product = relationship("Product")


class Inventory(Base):
    __tablename__ = "Inventory"
    productId: Mapped[str] = mapped_column(String, ForeignKey("Product.id"), primary_key=True)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    product = relationship("Product")


class OrderItem(Base):
    __tablename__ = "OrderItem"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    orderId: Mapped[str] = mapped_column(String, ForeignKey("Order.id"))
    productId: Mapped[str] = mapped_column(String, ForeignKey("Product.id"))
    quantity: Mapped[int] = mapped_column(Integer)
    unitPrice: Mapped[float] = mapped_column(Float)

    order = relationship("Order")
    product = relationship("Product")


class Address(Base):
    __tablename__ = "Address"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id"))
    line1: Mapped[str] = mapped_column(String)
    line2: Mapped[str | None] = mapped_column(String, nullable=True)
    city: Mapped[str] = mapped_column(String)
    state: Mapped[str | None] = mapped_column(String, nullable=True)
    postalCode: Mapped[str] = mapped_column(String)
    country: Mapped[str] = mapped_column(String)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    isDefault: Mapped[bool] = mapped_column(Boolean, default=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User")


# Association table name Prisma uses by default for m-n without explicit model
from sqlalchemy import Table, MetaData

metadata = Base.metadata

OrderToProduct = Table(
    "_OrderToProduct",
    metadata,
    Column("A", String, ForeignKey("Order.id"), primary_key=True),
    Column("B", String, ForeignKey("Product.id"), primary_key=True),
)
