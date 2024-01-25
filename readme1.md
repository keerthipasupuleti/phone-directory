Invoice should be already existing and not cancelled

Enter VIN no. in Vin Number text field under Inquiry section. System should fetch the Invoice No. and Invoice Number field will get auto populated.

 2.Enter Invoice No. in Invoice No. text field or VIN no. in Vin Number text field under Inquiry section and click on execute button other fields should get auto populated and click on Issue Credit Note button to generate a Credit Note.

3.When user finds that he wants to change (decrease) the price of the vehicle, then he must Issue the Credit Note. He needs to follow the below steps: 

         a)  Inquiry section Invoice Number and Credit Note. text field should be enabled, and other fields should be disable. Type of change should be Price or Unit. Enter Credit Note No. in the Credit Note No. text field and select Price radio button as Type.

       b) In case of select option as Price and execute, system will check the price of each car in that invoice from Price master @ system date timing.

     c) If all cars have same price, system will auto select “All Car" and user can select "Each Car" (System default at All Car)

    d)  When user selects Each car radio button the New Car Price and Air Car Price column will be enabled in Vehicle details table with data populated from Price Master. User can change new car price and air price by manual. 

    e) User can change (Total) New Unit Price same as current operation and not equal to '0'.

    f)  User can change (Total) Air Price same as the current operation.

   g) If All cars have different price, system will auto select as "Each Car" with warning message.

and user cannot change from "Each Car" to "All Car."

 h) New amount should be auto calculate based on modified price data

If user select option as unit and execute. "All Car" and "Each Car" radio button will be disabled. New Car Price and Air Price will disable.

4. Brand, Series, Model and Suffix should be displayed as text field in Vehicle details section as per current screen.

5. Motor (For EV vehicles) from the Vehicle Details table and add as Additional column in vehicle details table along with the existing columns.

6.VAT % field value should be 7 in Invoice Amount Details section.

7.Email field should be added in Customer details section as a mandatory field. The email addresses should be fetched from Customer Master Maintenance screen. This field is not editable. 

8.Customer details section cannot be editable for domestic customers, and it will be auto populated from Customer Master Maintenance screen. 

9.Remove Print Credit Note button.

Add Process:

Add is not allowed in this screen.

Edit Process:

Edit is allowed for Inquiry Section:

Invoice No.

Credit Note No.

Edit is allowed for Invoice Amount Details (without Vat)’ section

Reason drop down

Cancel drop down

Buttons:

Cancel Credit Note: To cancel the credit Note

Issue Credit Note: To generate the Credit Note
