Apologies for any confusion. Let's provide more detailed test cases for each scenario:

Test Case Scenario 1: Invoice Date Generation

Test Case 1.1: Confirm that the system-generated Invoice Date is not greater than the current System Date and is displayed in the correct format.
Test Case 1.2: If the System Date is before 07:00:01, verify that the Invoice Date considers the previous day (VSC_BATCH_TIME) and displays accordingly.

Test Case Scenario 2: Salesman Code Auto-population

Test Case 2.1: Enter a valid Salesman Code, click 'Issue Invoice,' and validate that the Salesman Name in Thai language auto-populates correctly.
Test Case 2.2: Test the smart dropdown for Salesman Code by entering the first 2-3 numbers, clicking 'Issue Invoice,' and ensuring relevant records populate as expected.

Test Case Scenario 3: Customer Code Auto-population

Test Case 3.1: Enter a valid Customer Code, click 'Issue Invoice,' and ensure related fields (Customer Name, Address, District, Sub-District, Province) auto-populate accurately.
Test Case 3.2: Test the smart dropdown for Customer Code, entering partial numbers, clicking 'Issue Invoice,' and verifying that the correct records populate.

Test Case Scenario 4: Zip Code Validation

Test Case 4.1: Enter a valid 5-digit Zip Code, click 'Issue Invoice,' and confirm no errors.
Test Case 4.2: Save without entering Zip Code, click 'Issue Invoice,' and verify the system displays a clear error message.

Test Case Scenario 5: Customer Details Autocomplete

Test Case 5.1: For a domestic customer, enter relevant details, click 'Issue Invoice,' and verify that fields in the Customer Details section, except for the Address field, are auto-completed.
Test Case 5.2: For an international customer, enter relevant details, click 'Issue Invoice,' and confirm that all fields in the Customer Details section remain as text fields.

Test Case Scenario 6: Without VAT Flag

Test Case 6.1: Check the Without VAT checkbox, click 'Issue Invoice,' and verify that the Without VAT field becomes read-only.
Test Case 6.2: Uncheck the Without VAT checkbox, click 'Issue Invoice,' and confirm that the Without VAT field is editable.

Test Case Scenario 7: Employee Code Enablement

Test Case 7.1: Select Specific Customer Code (7 Staff Cash Sales), enter relevant details, click 'Issue Invoice,' and ensure the Employee Code field is enabled.
Test Case 7.2: Verify the removal of the Dealer field in the new system after clicking 'Issue Invoice.'

These detailed test cases cover various scenarios in the invoicing system based on the provided requirements.
