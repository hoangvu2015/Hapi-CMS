
# Introduction
CMs Application

## Requirements
### Dev
- Nodejs 6.0 and above
- MongoDB
- Redis
- Elastic Search
- Nodemon: `npm install -g nodemon`

### Production
- Dev +
- pm2

## Install

```bash
cd web          # Change directory to web
npm install     # Install nodejs dependency
bower install   # Install bower dependency

```
- Import/Export MongoDB Database

```bash
cd misc/seeds  # Change directory to misc/seeds
node import    # Run this command to import default cms data
node export    # Run this command to export your cms data and share to team members

```
- Default CMS Account
```bash
admin@gmail.com/iii3studi1

```

## How to run:

- Using Nodemon

```bash
npm start          # In the service folder - example: cms, web, api-user
nodemon app         # In the service folder
```
or
```bash
gulp
```

## List services:
- API Server: [http://localhost:9001/](http://localhost:9001/documentation)
- Admin CMS: [http://localhost:9002/](http://localhost:9002/documentation)
- Web:  [http://localhost:9006/](http://localhost:9006/)

##Cấu trúc:
```bash
Antoree-CRM
| 
|--misc # Chứa hướng dẫn config server và import DB
|
|--web # Chứa site 
    |
    |--app # Chứa app chính
        |
        |--bootstrap # boot đầu tiên khi vào app
 		|
 		|--config # Chứa những config của site
 		|
 		|--lib # Chứa config thư viện được sử dụng
 		|
 		|--model # Chứa tấc model (colection) trong mongo
 		|
 		|--modules # Gồm những module admin, web, api 
 			|
 			|--(admin,web,api)-*
 				|
 				|--controller # Chứa controller server của module đó
 				|
 				|--util # chứa helper những function sử dụng chung cho module đó phía server 
 				|
 				|--view # Phần client
 					|
 					|--client # Chứa code client của module đó 
 		|
 		|--styles # Chứa styles chung của app
 		|
 		|--utils # phần helper dùng chung cho cả app
 		|
 		|--views # Chứa layout app
 	|
 	|--node_modules # thư viện node
 	|
 	|--public # phần công cộng
 		|
 		|--assets # Chứa (fonts, images, scripts, styles) của site
 		|
 		|--bower_components # Phần thư viện client
 		|
 		|--files # Chứa files upload




    
