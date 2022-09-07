# NMC Website Scrapper

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)
- [API](#api)

## About <a name = "about"></a>

NMC Website Scrapper. 

### METHODOLOGY
- It visits
```
https://www.nmc.org.uk/registration/employer-confirmations/
```

- Login as employee through Id and Pass

- Then NMC will show to input data of 5 nurses at a time.

- We only need to search one nurse at a time from here.

- For nurse search, we need to input DOB also with the pin.

- Download the details in PDF.

## Getting Started <a name = "getting_started"></a>

Make sure you have installed pre-requisite softwares to run this bot.

### Prerequisites

What things you need to install the software.

```
node
npm
```

### Installing


```
npm ci
node index.js
```


## Usage <a name = "usage"></a>

```
ip:8080
```


## API <a name = "api"></a>

#### API USAGE

```
http://localhost:8080/api/CODE?dob=DD-MM-YYYY

```
#### EXAMPLE

```
http://localhost:8080/api/01C0509E?dob=23-04-1979

```

#### RESPONSE

```
Returns PDF File.

```



