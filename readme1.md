S.No.	Label	Data Type*	"Input /
Output / Both"	Field Type**	Mandatory (Y/N)	Remarks(Old)	Remarks(Infosys)	Remarks(TDEM)
1	Invoice Date	D	Both	Txt		Invoice Date should be <= System Date		output only and one condition that if sysdate is before 07:00:01 then it will consider as yesterday date (VSC_BATCH_TIME)
2	Invoice No.	N	Both	Txt				output only. System auto generate
3	Invoice Due Date	D	Both	Txt				output only. System auto generate
4	Salesman Code	C	Both	Txt	Y			input only. The screen is not support for retrieval. Change to smart dropdown
5	Salesman Name	C	Output	Txt		Salesman First Name (Thai Input)		
6	Family Name	C	Output	Txt		Salesman Surname (Thai Input)		
7	Customer Code	C	Both	Txt	Y			input only. The screen is not support for retrieval. Change to smart dropdown
8	Sales Type	C	Output	Txt				
9	Sales Channel	C	Output	Txt		Display Sales Channel Code + Description		
10	Without VAT	C	Output	CB		Valid Values are 'Y' - Checked and Null - Unchecked		
11	Employee Code	C	Both	Txt				input only. Field enable for sales channel 7
12	Dealer	C	Both	CMB		"Populate using common function LP_DNS005_DLR_LIST
On selecting Dealer Code, display the Customer Name & Address fields automatically from INV_CUST_MST
"		will be removed in new system
13	Customer Details							
14	Tax ID	C	Both	Txt		"Incase of allow sell to person = 'Y' and without vat = 'N', the value will be numeric
Incase of allow sell to person = 'Y' and without vat = 'Y', the value can be numeric
Incase of customer code does not assign tax id, the value will be blank"		"retrive from customer master.
It may consider sales channel"
15	Business Place	C	Both	Txt		"Business Place||' '||Branch Code 
Ex. Incase of สำนักงานใหญ่ (Head Office) this field keep ""สำนักงานใหญ่""
incase of สาขาที่ (Branch) this field keep ""สาขาที่ 00001"""		"retrive from customer master.
It may consider sales channel"
16	Customer Name (Eng.)	C	Both	Txt	Y			retrive from customer master.
17	Customer Name (Thai)	C	Both	Txt	Y	Thai Input		retrive from customer master.
18	Address	C	Both	Txt		Thai Input		retrive from customer master.
19	Sub-District	C	Both	Txt		Thai Input		"retrive from customer master.
Auto populate for domestic"
20	District	C	Both	Txt		Thai Input		"retrive from customer master.
Auto populate for domestic"
21	Province	C	Both	Txt		Thai Input		"retrive from customer master.
Auto populate for domestic
How to suppoprt for other country?"
22	Zip	C	Both	Txt		Should allow Zip code 5 digit number or Blank else show error.		"retrive from customer master.
will be a mandatory field in new system"
23	Payment Term Details							
24	Payment Term	C	Both	CMB	Y			
25	Payment Due Days/Month	C	Both	CMB	Y	Valid Values are D - Days and M - Month		field get enabled depend on payment term
26	Payment Due Days	N	Both	Txt	Y	>= 0		field get enabled depend on payment term
27	Term (Years)	N	Both	Txt		>= 0		
28	Project Number	C	Both	Txt	Y			There is no project number. Is this asset number
29	Budget Number	C	Both	Txt	Y			There is no budget number. Is this SAP budget
30	Cost Center	C	Both	Txt	Y			Input only
31	Purchase Reqn No.	C	Both	Txt	Y	"Made this field mandatory with blue highlight.
Remove Mandatory checking for Sales channel 3,4,5."		Input only
32	Vehicle Details							data from matched data
33	Serial No.	N	Output	Txt	Y	Running Serial No.		
34	Series	C	Both	Txt	Y			Will be removed as text and added to vehicle table as additional colum in new system
35	Model/Sfx	C	Both	Txt	Y			Will be removed as text and added to vehicle table as additional colum in new system
36	Color Type	C	Both	CMB	Y	Display 0-Solid, 1-Metallic,2-Two-Tone		
37	Units	N	Output	Txt				
38	Vin No.	C	Both	Txt	Y			
39	Engine Prefix	C	Output	Txt				
40	Engine No.	C	Output	Txt				
41	Ext. Color	C	Output	Txt		Display Color Code + Color Name 		
42	Price Details							
43	Selling Price (Unit)	N	Both	TXT	Y	>=0		
44	Air Price (Unit)	N	Both	TXT		>=0		
45	Option Price (Unit)	N	Both	TXT		>=0		
46	Trade Discount	N	Both	TXT		>=0		
47	Down Payment	N	Both	TXT		>=0		
48	Interest Charge %	N	Both	TXT		>=0		
49	Leasing Customer details							
50	Customer Name	C	Both	TXT	Y	Thai field		
51	Address	C	Both	TXT	Y	Thai field		Auto populate for domestic
52	Sub-District	C	Both	TXT	Y	Thai field		Auto populate for domestic
53	District	C	Both	TXT	Y	Thai field		Auto populate for domestic
54	Province	C	Both	TXT	Y	Thai field		Auto populate for domestic
55	Zip	C	Both	TXT				Auto populate for domestic
56	Invoice Amount							
57	New Car	N	Output	Txt				
58	Air	N	Output	Txt				
59	Option	N	Output	Txt				
60	Total	N	Output	Txt		New Car Amount + Air Amount + Option Amount		
61	VAT %	N	Output	Txt				
62	Total VAT Amount	N	Output	Txt		New Car VAT Amount + Air VAT Amount + Option VAT Amount		
63	Installment Details							
64	First Due Date	D	Output	Txt				
65	Amount	N	Output	Txt				
66	Last Due Date	D	Output	Txt				
67	Amount	N	Output	Txt				
68	Credit Balance	N	Output	Txt				
69	Remarks	C	Both	Txt		memo type		
70	CoA WBS	C	Both	Txt	Y	"CoA WBS made this field with blue highlight.
Maximum input length is 24.
Mandatory for sales channel 3,4 except customer code
59100."		
71	Giveaway	C	Output	Txt		Thai Field		
72	Giveaway			B		Button		


Test Scenario	   Test Case
"Admin logs in and navigates to Invoicing 
and Registration -> Invoicing -> Direct Sales Invoice Issuing"		Confirm that the admin can successfully access the Direct Sales Invoice Issuing screen.
"TMT/SN user logs in and navigates to Invoicing 
and Registration -> Invoicing -> Direct Sales Invoice Issuing"		Ensure that the TMT/SN user can successfully access the Direct Sales Invoice Issuing screen.
Invoice Date 		After successful navigation, Invoice date should be available with current system date
"User starts typing the first 2-3 numbers of the 
Salesman Code."		Confirm that a dropdown appears, populating records based on the search in the dropdown.
User enters a valid Salesman Code.		"1. Verify that entering a valid Salesman Code auto-populates the Salesman Name from the
 Salesman Resume master form
2. Ensure that the system displays an error message indicating that the Salesman Code should not be the same as the Dealer Code."
User selects the Customer Code field.		"Ensure that the Customer Code field type is changed from text to a smart dropdown, 
populating data from the Customer Master Maintenance form(inv_cust_mat)"
"User selects a Customer code from the 
smart dropdown"		"Verify that required fields (Sales Type, Sales Channel, Customer Name, Address, 
Sub District/ District, Province) are auto-populated correctly. "
User enters the Customer name		verify the Customer code and other customer details populated if user enters customer name.
User enters Zip Code Manually		"1. Ensure there is a validation for Zip code( As of now there is no source to check valid code)
2. Confirm that the system provides functionality to select a zip code based on the district in the future."
User leaves the Zip Code field empty.		Validate that the system prompts the user to fill the mandatory Zip Code field in the Customer Details section.
"Customer is domestic, and the user interacts with the
 Address field."		Ensure that the Address field accepts input and provides autocomplete functionality for domestic customers.
"Customer is from outside the country, and the 
user interacts with the Customer Details section."		Confirm that the Customer Details section allows free text input for international customers
User selects the "Without VAT" checkbox.		Verify that selecting the checkbox flags the Without VAT field as read-only, denoting that the specific customer does not require VAT.
User manually enters an Employee Code		Confirm that the system allows the user to manually input the Employee Code
"User selects a specific Customer Code (7 Staff Cash Sa
les) and interacts with the Emp Code field."		Ensure that the Emp Code field is enabled only when the user selects the specific Customer Code.
"User manually enters Business Place and Tax ID for
 specific Customer Codes"		Confirm that the system allows manual entry and displays an error message if the entered Tax ID/Business Place is incorrect.
User selects a Payment Term from the dropdown		Verify that selecting a Payment Term auto-populates the Payment Due Days field and makes it unchangeable
"User manually enters data in SAP fields (Asset No, 
Purchase Reqn No, Cost Center Charge, SAP Budget 
No., Term (Years), WBS)."		Confirm that the system allows manual entry, and check whether there's a need for API calls for validation
Email field is added in the Customer details section		Confirm that the Email field is added as a mandatory field.
"User enters a Customer Code, and the Email field 
fetches the email address from the Customer Master 
Maintenance screen."		Verify that the Email field fetches the correct email address.
"User enters an invalid email address 
(missing '@' or '.' or contains special characters)"		Confirm that the system displays a warning message for an invalid email format.
"User overwrites the email address even after 
fetching it from the Customer Master Maintenance
screen."		Verify that the system allows overwriting of the email address.
User selects the Vehicle details		Ensure that Booking No., Customer Name, Series, and Model/Suffix columns are added along with the existing ones.
There are more than 20 records in the Vehicle details table		Verify that pagination is maintained, displaying 10 or 20 records per page.
"User utilizes search criteria with Booking No and 
Customer Name field and multiselect dropdown 
in the Vehicle details section"		"1. Verify the system filters the vehicle details based on booking no and company name, displaying only relevent records.
2. Confirm that system allows the selection of multiple values and filters the table accordingly, displaying the records that match the selected criteria.
3. Make sure sorting functionality works on the vehicle list."
User selects checkboxes for specific vehicles.		 Validate that selected records are displayed at the top of the list.
User selects the checkbox for leasing customer details		Confirm that Leasing Customer Details are enabled when the checkbox is selected
User enters W/S Selling Price, Air Price, Trade discount, down payment, interest.		"1. Ensure that W/S Selling Price is populated after clicking Get Price button and the selling Price should be editable.
2. Validate that system retrieves accurate price details fromPrice Master Maintenance form."
User clicks the Preview button(Preview button should be enabled)		Ensure that issue invoice button enabled only after clicking the Preview button.
"User clicks on the ""Issue Invoice"" button after 
completing all details"		Verify that the details related to issuing the invoice are sent to the SAP system.
![image](https://github.com/keerthipasupuleti/phone-directory/assets/36074761/b4fd2599-ae66-4116-bd78-79ff417b2506)

