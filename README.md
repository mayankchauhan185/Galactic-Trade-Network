# circlepeMayank
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
DEPLOYMENT INSTRUCTIONS

-first open the .env file and change NODE_ENV=development to NODE_ENV=production.
-Launch EC2 Instance
Create Instance:

-AMI: Choose Amazon Linux 2 or Ubuntu.
Instance Type: e.g., t2.micro.
Security Group: Allow HTTP (80) and HTTPS (443).
Key Pair: Download for SSH access.
ssh -i "your-key.pem" ec2-user@your-instance-public-dns


-Prepare Server
Update and Install:

Update Packages:
sudo yum update -y  # Amazon Linux 2 or CentOS
sudo apt update && sudo apt upgrade -y  # Ubuntu

Install Node.js:
sudo yum install -y nodejs npm  # Amazon Linux 2 or CentOS
sudo apt install -y nodejs npm  # Ubuntu

-Deploy Application:

Clone/Upload Code:
git clone https://github.com/mayankchauhan185/circlepeMayank
cd circlepeMayank

Install Dependencies:
npm install

-Install Dependencies:

Set Environment Variables:
export PORT=3000

Start Application:

Node:
node index.js

PM2:
sudo npm install -g pm2
pm2 start app.js
pm2 startup
pm2 save

-Configure Reverse Proxy (Nginx)
Install Nginx:

Amazon Linux 2/CentOS:
sudo yum install -y nginx

Ubuntu:
sudo apt install -y nginx

Configure Nginx:

Edit /etc/nginx/nginx.conf:
server {
    listen 80;
    server_name your-domain-or-ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

Restart Nginx:

sudo nginx -t
sudo systemctl restart nginx

-Secure Application
Update Security Groups:
Ensure ports 80 and 443 are open.

SSL/TLS Setup:
Use AWS Certificate Manager for SSL certificates and configure Nginx.

Access via EC2’s public IP or domain.
Ensure application functionality.
Monitor:

Set up CloudWatch monitoring and review logs.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

DESIGN DECISION AND ARCHITECTURAL CHOICES.

Activity-

The TradeActivityLog schema records different actions related to trade activities, such as purchases, sales, and updates. It includes references to users, goods, locations, and provides a timestamp for each action.

Fields
userId: Reference to the User model, indicating which user performed the action.
action: String describing the type of trade activity (e.g., "purchase", "sell", "shipment_update"). This field is required.
goodId: Reference to the SKU model, identifying the item involved in the activity.
quantity: Number indicating the quantity of goods involved in the activity.
locationId: Reference to the Location model, specifying the location related to the activity.
timestamp: Date when the activity was recorded. Defaults to the current date and time.
details: Additional information about the activity, such as "shipment in space".


Design and Architectural Choices
Schema References: Using ObjectId references (userId, goodId, locationId) enables the model to relate to other collections and maintain data integrity.
Required Field: The action field is mandatory to ensure that every log entry specifies what type of activity occurred.
Default Timestamps: The timestamp field automatically captures the time of the activity, simplifying logging and historical tracking.
Flexible Details: The details field allows for additional context, providing more information about the specific activity if needed.



Inventory-

The Inventory schema tracks the inventory levels of goods at different locations. It includes references to locations and goods, and records the last update time.

Fields
locationId: Reference to the Location model, specifying the location where the inventory is stored. This field is required.
goods: Array of objects where each object contains:
goodId: Reference to the SKU model, identifying the specific good.
quantity: Number representing the quantity of the good available at the location. This field is required.
lastUpdated: Date when the inventory was last updated. Defaults to the current date and time.


Design and Architectural Choices
Schema References: Using ObjectId references (locationId, goodId) establishes relationships between the Inventory, Location, and SKU models, ensuring data integrity and easy data retrieval.
Required Fields: locationId and quantity are mandatory, ensuring that every inventory entry is linked to a location and specifies a quantity for each good.
Default Timestamps: The lastUpdated field automatically records the time of the last update, aiding in tracking changes and maintaining data accuracy.




Location-

The Location schema captures details about locations, including their type, coordinates, and inventory capacity. It also maintains an inventory record and tracks the last update time.

Fields
name: String representing the name of the location. This field is required.
type: String that specifies the type of location. It can be either space_station or planet. This field is required.
coordinates: String that holds the galactic coordinates of the location (e.g., "X100,Y200,Z300"). This field is required.
capacity: Number indicating the maximum inventory capacity of the location. Defaults to 1000.
inventory: Array of objects where each object contains:
goodId: Reference to the SKU model, identifying the specific good.
quantity: Number representing the quantity of the good available at this location.
lastUpdated: Date when the inventory was last updated. Defaults to the current date and time.


Design and Architectural Choices
Schema References: Uses ObjectId references (goodId) to link the inventory items to the SKU model, enabling relational data management.
Enum for Type: Restricts the type field to predefined values (space_station, planet) to ensure valid location types.
Default Capacity: Sets a default capacity to handle initial inventory limits.
Timestamps: The lastUpdated field provides automatic tracking of inventory updates.




Shipment-

The Shipment schema details the cargo being shipped, its origin and destination, status updates, and real-time tracking information.

Fields
cargo: Array of objects detailing the goods being shipped:

goodId: Reference to the SKU model identifying the goods.
quantity: Number of each good being shipped.
origin: Reference to the Location model indicating where the shipment starts. This field is required.

destination: Reference to the Location model indicating where the shipment is headed. This field is required.

status: String describing the current status of the shipment. Possible values are pending, in_transit, delivered, and canceled. Defaults to pending.

departureDate: Date when the shipment departed. This field is required.

arrivalDate: Date when the shipment arrived at its destination. This field is optional.

cargoOperatorId: Reference to the User model identifying the operator managing the shipment.

realTimeUpdates: Array of objects providing real-time status updates for the shipment:

status: String describing the current status of the shipment (e.g., in_space, near_station, arrived). This field is required.
location: String indicating the coordinate location or nearby station/planet.
timestamp: Date and time when the update was recorded. Defaults to the current date and time.


Design and Architectural Choices
Schema References: Uses ObjectId references (goodId, origin, destination, cargoOperatorId) to establish relationships with the SKU, Location, and User models.
Status Enum: Limits the status and realTimeUpdates.status fields to predefined values, ensuring valid shipment states.
Required Fields: origin, destination, and departureDate are mandatory to ensure complete shipment information.
Real-Time Tracking: Includes a realTimeUpdates array to capture ongoing status changes and location updates, facilitating dynamic tracking.




SKU-

The SKU schema details the attributes of products, including their names, descriptions, categories, availability locations, and stock levels.

Fields
name: String representing the name of the SKU. This field is required.
description: String providing an optional description of the SKU.
category: String indicating the category of the SKU. It can be one of raw_material, manufactured, food, weaponry, or fuel.
availableAt: Array of ObjectId references to the Location model, specifying the space stations or planets where the SKU is available.
inStock: Number representing the total units of the SKU available in stock. Defaults to 0.

Design and Architectural Choices
Schema References: Utilizes ObjectId references in availableAt to link to the Location model, allowing for efficient querying of SKU availability across different locations.
Category Enum: Restricts the category field to predefined values to maintain consistency and validity.
Default Stock: Initializes inStock with a default value of 0 to handle cases where no units are initially available.




User-

The User schema defines user attributes, including their credentials, role, trade history, and token information.

Fields
name: Optional string representing the name of the user.
password: Optional string for the user's password.
email: Required string for the user's email address. It is unique and indexed to ensure no duplicate entries.
createdOn: Date indicating when the user was created. Defaults to the current date and time.
modifiedOn: Date indicating when the user information was last modified. Defaults to the current date and time.
role: String defining the user's role with options such as buyer, seller, admin, and cargo_operator. Defaults to buyer.
tradeHistory: Array of objects detailing the user's trade transactions:
goodId: Reference to the SKU model identifying the traded goods.
quantity: Number representing the quantity of goods traded.
tradeDate: Date when the trade occurred. Defaults to the current date and time.
refreshToken: Optional string for storing refresh tokens used for authentication.

Design and Architectural Choices
Email Indexing: The email field is indexed and unique to ensure efficient querying and prevent duplicate entries.
Role Enum: Uses an enum for the role field to restrict user roles to predefined values, ensuring role consistency.
Timestamps: The createdOn and modifiedOn fields automatically manage record creation and updates.
Optional Fields: Allows flexibility with optional fields like name, password, and refreshToken.
