Certainly! Let's break down the detailed test scenarios and test cases based on the provided information:

### **1. Email Field:**
   - **Scenario 1: Email Validation:**
     - *Test Case 1:* Check if the email field is added to the Customer Details section.
     - *Test Case 2:* Confirm that the email addresses are fetched from the Customer Master Maintenance screen.
     - *Test Case 3:* Try entering an email with missing '@' or '.' and validate that the system displays a warning message.
     - *Test Case 4:* Overwrite the email address and confirm that the original email remains unchanged in the Customer Master Maintenance screen and database.

### **2. Vehicle Details Section:**
   - **Scenario 2: Vehicle Details Table Modification:**
     - *Test Case 5:* Confirm that Booking No. and Customer Name columns are added to the Vehicle details table.
     - *Test Case 6:* Verify that Series and Model/Suffix columns are included in the Vehicle table.
     - *Test Case 7:* Check if Color Type displays '0-Solid, 1-Metallic,2-Two-Tone' in the Vehicle table.
     - *Test Case 8:* Validate the existence of a link to the Matched Data Screen in the Vehicle details section.

### **3. Pagination and Search Criteria:**
   - **Scenario 3: Table Management:**
     - *Test Case 9:* Confirm that pagination is maintained, showing 10/20 records per page when there are more than 20 records.
     - *Test Case 10:* Validate the presence of search criteria for Booking No and Customer Name along with a search button.
     - *Test Case 11:* Confirm the addition of a multiselect dropdown for other columns in the Vehicle details table.
     - *Test Case 12:* Ensure the sorting functionality works correctly in the table list.

### **4. Checkbox Selection:**
   - **Scenario 4: Checkbox Selection:**
     - *Test Case 13:* Confirm that checkboxes are present in the table list to select specific vehicles.
     - *Test Case 14:* Select a checkbox and validate that the selected records move to the top of the list.

### **5. Leasing Customer Details:**
   - **Scenario 5: Leasing Customer Details:**
     - *Test Case 15:* Enable Leasing Customer Details by selecting the checkbox.
     - *Test Case 16:* Verify that Customer Name, Address, Sub-District, District, Province, and Zip are displayed in Thai.

### **6. Invoice Amount Calculation:**
   - **Scenario 6: Invoice Amount Calculation:**
     - *Test Case 17:* Confirm that Total VAT Amount is calculated correctly with New Car VAT Amount + Air VAT Amount + Option VAT Amount.
     - *Test Case 18:* Validate the calculation of Total Invoice Amount as New Car Amount + Air Amount + Option Amount.

### **7. Button and Issue Invoice:**
   - **Scenario 7: Buttons and Issue Invoice:**
     - *Test Case 19:* Confirm that the Print Invoice button is removed.
     - *Test Case 20:* Verify the presence of a Preview button.
     - *Test Case 21:* Ensure that Issue Invoice is enabled only after clicking the Preview button.

### **8. W/S Selling Price and Get Price Details:**
   - **Scenario 8: W/S Selling Price and Get Price Details:**
     - *Test Case 22:* Enter Vehicle details in the table and verify that W/S Selling Price is populated and editable.
     - *Test Case 23:* Confirm that Get Price details are retrieved correctly from the Price Master Maintenance form.

### **9. SAP Integration:**
   - **Scenario 9: SAP Integration:**
     - *Test Case 24:* Enter details and verify that details related to Issue Invoice are successfully sent to the SAP system.

These test cases cover various aspects of the provided information to ensure the functionality and integration are working as expected.
