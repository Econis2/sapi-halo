# sapi-halo
System API for System control of Haloded.exe (Halo: Combat Evolved server)

## **api/servers**


#### **GET:**
<hr>

**Description:** Return a list of running instances of haloded.exe

**Response:**
```
HTTP [200]
{
  "example": "json"
}
```
<br>

#### **POST:**
<hr>

**Description:** Creates a new running instances of haloded.exe

**Body:**
```
{
  "example": "json"
}
```
**Response:**
```
HTTP [204]
```
<br>

## **api/servers/:id**

#### **GET:**
<hr>

**Description:** Return a specific running instance of haloded.exe

**Response:**
```
HTTP [200]
{
  "example": "json"
}
```
<br>


#### **DELETE:**
<hr>

**Description:** Remove a specific running instance of haloded.exe

**Response:**
```
HTTP [204]
```
