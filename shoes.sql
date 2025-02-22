CREATE TABLE
  Shoes (
    shoesId SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    typeId INT NOT NULL REFERENCES ShoeTypes(typeId),
    brandId INT NOT NULL REFERENCES Brands(brandId),
    sizeId INT NOT NULL REFERENCES Sizes(sizeId),
    colour VARCHAR(30) NOT NULL CHECK (colour <> ''),
    miscellaneous TEXT NOT NULL,
    costPrice DECIMAL(9,2) NOT NULL,
    imageAWS TEXT 
  )
  
CREATE TABLE
  ShoeTypes (
    typeId SERIAL PRIMARY KEY,
    typeName VARCHAR(30) NOT NULL UNIQUE CHECK (typeName <> '')
  )

CREATE TABLE
  Brands (
    brandId SERIAL PRIMARY KEY,
    brandName VARCHAR(30) NOT NULL UNIQUE CHECK (brandName <> '')
  )

CREATE TABLE
  Sizes (
    sizeId SERIAL PRIMARY KEY,
    sizeCountry VARCHAR(5) NOT NULL CHECK (sizeCountry IN ('US', 'UK', 'EURO')),
    sizeNumber DECIMAL(3,1) NOT NULL UNIQUE CHECK (sizeNumber <> 0)
  )

CREATE TABLE
  Sales (
    salesId SERIAL PRIMARY KEY,
    shoesId INT NOT NULL REFERENCES Shoes(shoesId),
    salePrice DECIMAL(9,2) NOT NULL,
    revenue DECIMAL(9,2) NOT NULL
  )
