Menu/Navigation: Invoicing and Registration--> Invoicing--> Direct Sales Invoice Issuing.

In the Inquiry section, Invoice date is system generated and Invoice No. will be auto generated after filling up the data in mandatory fields and then clicks on ’Issue Invoice' button. Invoice Date should be <= System Date. output only and one condition that if sysdate is before 07:00:01 then it will consider as yesterday date (VSC_BATCH_TIME)

When user provides the Salesman Code, the Salesman name should auto-populate and Salesman name and family name is thai language. The Salesman code data come from Salesman Resume master form. Navigation should be Dealer Operations->>Salesman Profile Input and Report>>Salesman Resume (approval). 
Salesman code input only. The screen is not support for retrieval. Change to smart dropdown

The Salesman code should be made a dropdown so if user puts first 2-3 numbers, then it will populate records based on the search in the dropdown.

Once user enters Customer Code other fields related to customer (Customer Name (Eng), Customer Name (Thai), Address, District, Sub-District, Province) should be auto populated. As per current functionality user can enter Zip code manually. However, in future there can be a new screen once user clicks on Zip code field to select zip code based on district.

 Customer code field type needs to be changed from text to smart dropdown and the data come from Customer Master Maintenance form and Customer code is input only, The screen is not support for retrieval. Change to smart dropdown. 
 
 Zip code should be a mandatory field in Customer details section and Should allow Zip code 5 digit number or Blank else show error.. 

If customer is domestic, then other fields in Customer detail section should be autocomplete accept from Address field. If customer is from outside of the country, then all the fields under Customer Details section should be text field. 

Without Vat should be read only field in new system. We can use it as a flag . This data come from Customer Master Maintenance form. If user would have selected check box for Without VAT, then it denotes that specific customer does not require VAT. Valid Values are 'Y' - Checked and Null - Unchecked

Emp code will be manually entered by the user. Emp Code should be enabled based on select Specific Customer Code (7 Staff Cash Sales). Dealer field will be removed in the new system.(Change)

For some Customer Code Business Place and Tax Id fields should be manually entered and for some Customer Code it will be automatically Populated. If the entered Tax Id/ Business Place is wrong, then system should display error message.

Tax Id - Incase of allow sell to person = 'Y' and without vat = 'N', the value will be numeric
Incase of allow sell to person = 'Y' and without vat = 'Y', the value can be numeric
Incase of customer code does not assign tax id, the value will be blank

Business Place - Business Place||' '||Branch Code 
Ex. Incase of สำนักงานใหญ่ (Head Office) this field keep "สำนักงานใหญ่"
incase of สาขาที่ (Branch) this field keep "สาขาที่ 00001"
When user enters salesman code, it should not be the same as dealer code.

Customer Name will be in English and retrieved from customer master table.
Customer Name (Thai) and and retrieved from customer master table.

When user selects Payment Term from drop down, then Payment due days(>=0) field (Valid Values are D - Days and M - Month)will be auto populated and cannot be changed and Term(years) field >=0.

WBS made this field with blue highlight.Maximum input length is 24.Mandatory for sales channel 3,4 except customer code 59100.

Other fields from Payment Term Details section (Asset No, Purchase Reqn No(Made this field mandatory with blue highlight.
Remove Mandatory checking for Sales channel 3,4,5.), Cost Center Charge, SAP Budget No., Term (Years), WBS) come from SAP and user can enter the data manually. Currently we do not have any field validation to check whether the user have entered the correct data or not. Business will check whether any API call is required for validation or not.

Email field should be added in Customer details section as a mandatory field. The email addresses should be fetched from Customer Master Maintenance screen. If the user enters wrong email id (if @ /. is missing or entered any special character) then system should display a warning message. Email Id can be overwritten even after fetched from Customer Master Maintenance screen. However, original email Id will remain same in Customer Master Maintenance screen and database.

Add Booking no. and customer name column in the Vehicle details table along with the existing columns. Also add Series and Model/Suffix in Vehicle table as column. In column Color type field - Display 0-Solid, 1-Metallic,2-Two-Tone

There will be a link on Vehicle details section to redirect to Matched Data Screen and the vehicle related data should come from there.

If there are more than 20 records in Vehicle details table, then we need to maintain the pagination and each page we can have 10/20 records.

Add search criteria section with Booking No and Customer Name field along with search button. Also add multiselect dropdown for other columns. Sorting functionality should be there in table list as well.

Check boxes need to be there in the table list to select specific vehicles. Once user select checkbox, the select records can be on the top of the list.

Vehicle List button should be removed in the new system.

Leasing Customer Details can be enabled once user selects the checkbox and below fields should be in thai

Customer Name
Address
Sub-District
District
Province
Zip


Below values should be >=0
Selling Price (Unit)
Air Price (Unit)
Option Price (Unit)
Trade Discount
Down Payment
Interest Charge %

Invoice amount - Total VAT Amount is calculated with New Car VAT Amount + Air VAT Amount + Option VAT Amount
Invoice amount - Total is calcuated with New Car Amount + Air Amount + Option Amount
Print Invoice button not required and can be removed.

Need a Preview button in place of Print Invoice. Once user clicks on it then only Issue invoice will be enabled.

Once user enter Vehicle details in table then W/S Selling Price field will get populated, and user can also edit it.

Get Price details come from Price Master Maintenance form.

Details related to Issue Invoice should be send to SAP system.
