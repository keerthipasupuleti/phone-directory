# phone-directory
It is about phone directory which we can add and delete the subscriber.we can add the subscriber by clicking on the ADD button and delete the subscriber by clicking on the DELETE button 

	default:																	
	  tags:																	
	    - docker																	
	stages:																	
	  - prod approval																	
	  - compile																	
	  - unit test																	
	  - code scan																	
	  - image build																	
	  - image scan																	
	  - image push																	
	  - prod promote											r						
	  - deployment																	
	  - testing																	
	variables:																	
	  ## PROJECT_NAME and SERVICE_NAME cannot use underscore "_"																	
	  PROJECT_NAME: "e-commerce-website"																	
	  SERVICE_NAME: "sample-container-eks-app"																	
	  SERVICE_VERSION: "v1.0.0"																	
	  ## Required variable for artifact-push as project artifactory (if needed)																	
	  #REPO_KEY: "pcec-project-aws"																	
	  DIRECTORY_BUILD: "publish"																	
	include:																	
	  - project: "DevSecOps/cicd-template"																	
	    ref: master																	
	    file: "/templates/e-commerce/template-aws-harbor-pipeline-v1.0.0.yml"																	
																		
	.compile:  																	
	  stage: compile																	
	  variables:																	
	  script:																	
	    - echo "compile process" >> artifact.txt																	
	  artifacts:																	
	    paths:																	
	      - ./$DIRECTORY_BUILD/artifact.txt																	
	  only:																	
	    - develop																	
																		
	config:develop:																	
	  extends: .compile																	
	  before_script:																	
	      - echo "Update properties DEV"																	
	      #- sed -i 's/${SERVER_IP}/'"$SERVER_IP_DEV"'/g' ./src/WebAppSample.Web/Web.config																	
	      #- sed -i 's/${DB_USER}/'"$DB_USER_DEV"'/g' ./src/WebAppSample.Web/Web.config																	
	      #- sed -i 's/${DB_PASSWORD}/'"$DB_PASSWORD_DEV"'/g' ./src/WebAppSample.Web/Web.config																	
	  only:																	
	    - develop																	
																		
	config:prod:																	
	  extends: .compile																	
	  before_script:																	
	      - echo "Update properties DEV"																	
	      #- sed -i 's/${SERVER_IP}/'"$SERVER_IP_DEV"'/g' ./src/WebAppSample.Web/Web.config																	
	      #- sed -i 's/${DB_USER}/'"$DB_USER_DEV"'/g' ./src/WebAppSample.Web/Web.config																	
	      #- sed -i 's/${DB_PASSWORD}/'"$DB_PASSWORD_DEV"'/g' ./src/WebAppSample.Web/Web.config																	
	  only:																	
	    - /^v[0-9]\d*(\.[0-9]\d*)*$/																	
																		
	Unit test:																	
	  stage: unit test																	
	  script:																	
	    # Developer must be implement command for testing in this job																	
	    - echo "Test"																	
	  only:																	
	    - develop																	
																		
	.version checking:																	
	  stage: testing																	
	  image: $DOMAIN_NAME_TCR/hubdocker/everpeace/curl-jq:latest																	
	  tags:																	
	    - docker																	
	  script:																	
	    #- curl -k $SERVICE_URL/actuator/info | jq -r .app.version | grep $SERVICE_VERSION																	
	    - echo "testing service [actuator] status"																	
																		
	.smoke test:																	
	  stage: testing																	
	  image: $DOMAIN_NAME_TCR/hubdocker/everpeace/curl-jq:latest																	
	  tags:																	
	    - docker																	
	  script:																	
	    #- curl -k $SERVICE_URL/actuator/health | jq -r .status |grep "UP"																	
	    - a=`curl http://10.249.13.103:8080/weatherforecast`																	
	    - echo $a																	
	    - echo "smoke testing"																	
																		
	.api test:																	
	  stage: testing																	
	  image:																	
	    name: $DOMAIN_NAME_TCR/hubdocker/postman/newman:latest																	
	    entrypoint: [""]																	
	  tags:																	
	    - docker																	
	  before_script:																	
	    #- apk add sed																	
	    #- npm i -g newman-reporter-htmlextra																	
	  script:																	
	    - echo "testing api Newman"																	
																		
	# DEV Testing																	
	version checking:develop:																	
	  extends: .version checking																	
	  variables:																	
	    SERVICE_URL: $SERVICE_DEV_URL																	
	  only:																	
	    - develop																	
																		
	smoke test:develop:																	
	  extends: .smoke test																	
	  variables:																	
	    SERVICE_URL: $SERVICE_DEV_URL																	
	  only:																	
	    - develop																	
																		
	api test:develop:																	
	  extends: .api test																	
	  variables:																	
	    SERVICE_URL: $SERVICE_DEV_URL																	
	  only:																	
	    - develop																	
																		
	# PROD Testing																	
	version checking:prod:																	
	  extends: .version checking																	
	  variables:																	
	    SERVICE_URL: $SERVICE_PROD_URL																	
	  only:																	
	    - /^v[0-9]\d*(\.[0-9]\d*)*$/																	
																		
	smoke test:prod:																	
	  extends: .smoke test																	
	  variables:																	
	    SERVICE_URL: $SERVICE_PROD_URL																	
	  only:																	
	    - /^v[0-9]\d*(\.[0-9]\d*)*$/																	
																		
																		
	deployment:develop:																	
	  stage: deployment																	
	  image: $DOMAIN_NAME_TCR/golden-image/tdem/aws-azure-login-tdem:1.1																	
	  before_script:																	
	    - |																	
	      apt-get update \																	
	      && apt-get install -y python-pip																	
	    - pip install awscli																	
	    - curl -o kubectl http://THEPAIFD01.tmap-em.toyota-asia.com/download/Runner/kubectl/1.22.6/kubectl																	
	    - aws --version																	
	    - mkdir /root/.aws																	
																		
	    																	
	  script:																	
	    - echo "[default]" >> /root/.aws/config																	
	    - echo "azure_tenant_id=$AZURE_TENANT_ID" >> /root/.aws/config																	
	    - echo "azure_app_id_uri=$AZURE_APP_ID_URI" >> /root/.aws/config																	
	    - echo "azure_default_username=$AZURE_DEFAULT_USERNAME" >> /root/.aws/config																	
	    - echo "azure_default_role_arn=$AZURE_DEFAULT_ROLE_ARN" >> /root/.aws/config																	
	    - echo "azure_default_duration_hours=$AZURE_DEFAULT_DURATION_HOURS" >> /root/.aws/config																	
	    - echo "azure_default_remember_me=$AZURE_DEFAULT_REMEMBER_ME" >> /root/.aws/config																	
	    - echo "[profile non-prod]" >> /root/.aws/config																	
	    - echo "role_arn=$ROLE_ARN_NONPROD" >> /root/.aws/config																	
	    - echo "source_profile=$SOURCE_PROFILE" >> /root/.aws/config																	
	    - echo "region=$REGION" >> /root/.aws/config																	
	    - aws-azure-login --no-sandbox --no-prompt																	
	    # Add Handle a timeout issue when login via AWS SAML																	
	    - |																	
	      if [ ! -f /root/.aws/credentials ]; then CREDFILE=1; else CREDFILE=0; fi																	
	      echo $CREDFILE																	
	      COUNT=0																	
	      while [ "$CREDFILE" -eq 1 ]																	
	      do																	
	      if [ "$COUNT" -eq 5 ] ; then																	
	          exit 0																	
	      fi																	
	      if [ "$CREDFILE" -eq 0 ]; then																	
	          exit 0																	
	      fi																	
	      COUNT=`expr $COUNT + 1`																	
	      sleep 30																	
	      echo "Sleep 30s"																	
	      aws-azure-login --no-sandbox --no-prompt																	
	      if [ ! -f /root/.aws/credentials ]; then CREDFILE=1; else CREDFILE=0; fi																	
	      echo 'Timeout is suspected ' $COUNT																	
	      done																	
	      echo Done 																	
	    ### Remark: Development Team can modify this command below refer to your project needs 																	
	    - aws sts get-caller-identity --profile non-prod    																	
	    - echo "eks deployment start"																	
	    - aws eks --region $REGION update-kubeconfig --name tcoth-dev-eks-cluster --profile non-prod																	
	    - kubectl get nodes																	
	    																	
	  only:																	
	    - develop																	
																		
	deployment:prod:																	
	  stage: deployment																	
	  image: $DOMAIN_NAME_TCR/golden-image/tdem/aws-azure-login-tdem:1.1																	
	  before_script:																	
	    - |																	
	      apt-get update \																	
	      && apt-get install -y python-pip																	
	    - pip install awscli																	
	    - curl -o kubectl http://THEPAIFD01.tmap-em.toyota-asia.com/download/Runner/kubectl/1.22.6/kubectl																	
	    - aws --version																	
	    - mkdir /root/.aws																	
	    #- apt-get install jq -y 																	
	  script: 																	
	    - echo "[default]" >> /root/.aws/config																	
	    - echo "azure_tenant_id=$AZURE_TENANT_ID" >> /root/.aws/config																	
	    - echo "azure_app_id_uri=$AZURE_APP_ID_URI" >> /root/.aws/config																	
	    - echo "azure_default_username=$AZURE_DEFAULT_USERNAME" >> /root/.aws/config																	
	    - echo "azure_default_role_arn=$AZURE_DEFAULT_ROLE_ARN" >> /root/.aws/config																	
	    - echo "azure_default_duration_hours=$AZURE_DEFAULT_DURATION_HOURS" >> /root/.aws/config																	
	    - echo "azure_default_remember_me=$AZURE_DEFAULT_REMEMBER_ME" >> /root/.aws/config																	
	    - echo "[profile prod]" >> /root/.aws/config																	
	    - echo "role_arn=$ROLE_ARN_PROD" >> /root/.aws/config																	
	    - echo "source_profile=$SOURCE_PROFILE" >> /root/.aws/config																	
	    - echo "region=$REGION" >> /root/.aws/config																	
	    - aws-azure-login --no-sandbox --no-prompt																	
	   # Add Handle a timeout issue when login via AWS SAML																	
	    - |																	
	      if [ ! -f /root/.aws/credentials ]; then CREDFILE=1; else CREDFILE=0; fi																	
	      echo $CREDFILE																	
	      COUNT=0																	
	      while [ "$CREDFILE" -eq 1 ]																	
	      do																	
	      if [ "$COUNT" -eq 5 ] ; then																	
	          exit 0																	
	      fi																	
	      if [ "$CREDFILE" -eq 0 ]; then																	
	          exit 0																	
	      fi																	
	      COUNT=`expr $COUNT + 1`																	
	      sleep 30																	
	      echo "Sleep 30s"																	
	      aws-azure-login --no-sandbox --no-prompt																	
	      if [ ! -f /root/.aws/credentials ]; then CREDFILE=1; else CREDFILE=0; fi																	
	      echo 'Timeout is suspected ' $COUNT																	
	      done																	
	      echo Done 																	
																		
	    ### Remark: Development Team can modify this command below refer to your project needs 																	
	    - aws sts get-caller-identity --profile prod																	
	    - echo "eks deployment to prod start" 																	
	    #- aws eks --region $REGION update-kubeconfig --name tcoth-pcec-eks-cluster --profile non-prod																	
	    #- kubectl get nodes																	
	  only:																	
	    - /^v[0-9]\d*(\.[0-9]\d*)*$/																	
																		
																		
	Gitlab Template for E-commerce website (AWS)																	
																		
	DevSecOps > cicd-template >  templates > tcoth > template-aws-harbor-pipeline-v1.0.0.yml																	
	https://scm.ap.toyota-asia.com/devsecops/cicd-template/-/blob/master/templates/pcec/template-aws-harbor-pipeline-v1.0.0.yml																	
																		
	include:																	
	  - local: /stages/code-scan/code-scan-nodejs-v1.0.0.yml																	
	  - local: /stages/image-build/image-build-v1.0.0.yml																	
	  - local: /stages/image-scan/image-scan-v1.0.0.yml																	
	  - local: /stages/image-push/image-push-v1.0.0.yml																	
	  - local: /stages/prod-approval/prod-approval-v1.0.0.yml																	
	  - local: /stages/prod-promote/dev-to-prod-promote-v1.0.0.yml																	
																		
																		
																		
																		
																		
																		
![image](https://github.com/keerthipasupuleti/phone-directory/assets/36074761/b6ecf89d-419d-41cf-b1cb-3228132fbc6a)

---
----------------
apiVersion: apps/v1
kind: Deployment
metadata:
 name: tcoth-frontend
 namespace: default
spec:
 selector:
   matchLabels:
     app: tcoth-frontend
 replicas: 1
 template:
   metadata:
     labels:
       app: tcoth-frontend
   spec:
     containers:
       - name: tcoth-frontend
         image: tcr.ap.toyota-asia.com/toyota-thailand-website/tcoth-frontend:$SERVICE_VERSION-dev
         imagePullPolicy: Always
         resource:
         envFrom:
           - configMapRef:
               name: frontend-env-config
           - secretRef:
               name: tcoth-dev-secret
     imagePullSecrets:
       - name: harbor-config
---
apiVersion: v1
kind: Service
metadata:
 name: tcoth-frontend-service
 namespace: default
spec:
 type: NodePort
 selector:
   app: tcoth-frontend
 ports:
   - name: http
     protocol: TCP
     port: 8030
     targetPort: 80
     nodePort: 30001
---
apiVersion: v1
kind: Secret
metadata:
 name: harbor-config
 namespace: default
data:
 .dockerconfigjson: eyJhdXRocyI6eyJ0Y3IuYXAudG95b3RhLWFzaWEuY29tL21vZGVybi1hcHAtc3RkIjp7InVzZXJuYW1lIjoicm9ib3QkbW9kZXJuLWFwcC1zdGQiLCJwYXNzd29yZCI6IjZyeHozVndSeWxFMW5tSlFMQ2Jia29FaDJMZU9pOHJCIiwiYXV0aCI6ImNtOWliM1FrYlc5a1pYSnVMV0Z3Y0MxemRHUTZObko0ZWpOV2QxSjViRVV4Ym0xS1VVeERZbUpyYjBWb01reGxUMms0Y2tJS0Nnbz0ifX19
type: kubernetes.io/dockerconfigjson
 
---------------------------------------------------------------------------------------
in .dockerconfigjson you can use base64 to encode Base64 string encoder/decoder - IT Tools (it-tools.tech)
--------------------
Access Details : This screen can be accessed by Admin and TMT/SN.
Menu/Navigation: Invoicing and Registration--> Invoicing--> Direct Sales Invoice Issuing.
In the ‘Inquiry’ section, Invoice date is system generated and ‘Invoice’ no. will auto generate after clicking on ’Issue Invoice' button.

When user provides the Salesman Code, the Salesman name should auto-populate. The Salesman code data come from Salesman Resume master form. Navigation should be Dealer Operations->>Salesman Profile Input and Report>>Salesman Resume (approval).

The Salesman code should be made a dropdown so if user puts first 2-3 numbers, then it will populate records based on the search in the dropdown. 

Once user enters Customer Code other fields related to customer (Customer Name (Eng), Customer Name (Thai), Address, District, Sub-District, Province) should be auto populated. As per current functionality user can enter Zip code manually. However, in future there can be a new screen once user clicks on Zip code field to select zip code based on district. Customer code field type needs to be changed from text to smart dropdown and the data come from Customer Master Maintenance form. Zip code should be a mandatory field in Customer details section.

If customer is domestic, then Customer detail section accept from Address field should be autocomplete. If customer is from outside of the country, then Customer Details section should be text field 

Without Vat should be read only field in new system. We can use it as a flag. This data come from Customer Master Maintenance form. If user would have selected check box for Without VAT, then it denotes that specific customer does not require VAT.

Emp code will be manually entered by the user. Emp Code should be enabled based on select Specific Customer Code (7 Staff Cash Sales) . Dealer field will be removed in the new system.

For some Customer Code Business Place and Tax Id fields should be manually entered and for some Customer Code it will be automatically Populated. If the entered Tax Id/ Business Place is wrong, then system should display error message.

When user enters salesman code, it should not be the same as dealer code.

When user selects Payment Term from drop down, then Payment due days field will be auto populated and cannot be changed.

Other fields from Payment Term Details section (Asset No, Purchase Reqn No, Cost Center Charge, SAP Budget No., Term (Years), WBS) come from SAP and user can enter the data manually. Currently we do not have any field validation to check whether the user have entered the correct data or not. Business will check whether any API call is required for validation or not.

Email field should be added in Customer details section as a mandatory field. The email addresses should be fetched from Customer Master Maintenance screen. If the user enters wrong email id (if @ /. is missing or entered any special character) then system should display a warning message. Email Id can be overwritten even after fetched from Customer Master Maintenance screen. 

Add Booking no. and customer name column in the Vehicle details table along with the existing columns. Also add Series and Model/Suffix in Vehicle table as column

There will be a link on Vehicle details section to redirect to Matched Data Screen and the vehicle related data should come from there.

If there are more than 20 records in Vehicle details table, then we need to maintain the pagination and each page we can have 10/20 records.

Add search criteria section with Booking No and Customer Name field along with search button. Also add multiselect dropdown for other columns. Sorting functionality should be there in table list as well.

Check boxes need to be there in the table list to select specific vehicles. Once user select checkbox, the select records can be on the top of the list.

Vehicle List button should be removed in the new system.

Leasing Customer Details can be enabled once user selects the checkbox.

Print Invoice button not required and can be removed.

Need a Preview button in place of Print Invoice. Once user clicks on it then only Issue invoice will be enabled.

Once user enter Vehicle details in table then W/S Selling Price field will get populated, and user can also edit it.

Get Price details come from Price Master Maintenance form.

Details related to Issue Invoice should be send to SAP system.
----
Great! Let's create test case scenarios and test cases based on the provided details for the "Direct Sales Invoice Issuing" screen:

**Scenario: Accessing Direct Sales Invoice Issuing Screen:**

1. **Admin Access:**
   - *Scenario:* Admin logs in and navigates to Invoicing and Registration -> Invoicing -> Direct Sales Invoice Issuing.
   - *Test Case:* Confirm that the admin can successfully access the Direct Sales Invoice Issuing screen.

2. **TMT/SN Access:**
   - *Scenario:* TMT/SN user logs in and navigates to Invoicing and Registration -> Invoicing -> Direct Sales Invoice Issuing.
   - *Test Case:* Ensure that the TMT/SN user can successfully access the Direct Sales Invoice Issuing screen.

**Scenario: Salesman Code Functionality:**

3. **Entering Salesman Code:**
   - *Scenario:* User enters a valid Salesman Code.
   - *Test Case:* Verify that entering a valid Salesman Code auto-populates the Salesman Name from the Salesman Resume master form.

4. **Salesman Code Dropdown Search:**
   - *Scenario:* User starts typing the first 2-3 numbers of the Salesman Code.
   - *Test Case:* Confirm that a dropdown appears, populating records based on the search in the dropdown.

**Scenario: Customer Details Functionality:**

5. **Entering Customer Code:**
   - *Scenario:* User enters a valid Customer Code.
   - *Test Case:* Verify that entering a valid Customer Code auto-populates related fields (Customer Name (Eng), Customer Name (Thai), Address, District, Sub-District, Province) from the Customer Master Maintenance form.

6. **Zip Code Field Functionality:**
   - *Scenario:* User clicks on the Zip Code field.
   - *Test Case:* Confirm that the system provides functionality to select a zip code based on the district in the future.

7. **Customer Code Dropdown Transformation:**
   - *Scenario:* User selects the Customer Code field.
   - *Test Case:* Ensure that the Customer Code field type is changed from text to a smart dropdown, populating data from the Customer Master Maintenance form.

8. **Mandatory Zip Code Field:**
   - *Scenario:* User leaves the Zip Code field empty.
   - *Test Case:* Validate that the system prompts the user to fill the mandatory Zip Code field in the Customer Details section.

**Scenario: Handling Without VAT Flag:**

9. **Without VAT Checkbox Selection:**
    - *Scenario:* User selects the "Without VAT" checkbox.
    - *Test Case:* Verify that selecting the checkbox flags the Without VAT field as read-only, denoting that the customer does not require VAT.

**Scenario: Employee Code Entry and Dealer Field Removal:**

10. **Entering Employee Code:**
    - *Scenario:* User manually enters an Employee Code.
    - *Test Case:* Confirm that the system allows the user to manually input the Employee Code.

11. **Dealer Field Removal:**
    - *Scenario:* User navigates through the fields.
    - *Test Case:* Ensure that the Dealer field is removed from the screen in the new system.

**Scenario: Business Place and Tax ID Handling:**

12. **Entering Business Place and Tax ID:**
    - *Scenario:* User manually enters Business Place and Tax ID for specific Customer Codes.
    - *Test Case:* Confirm that the system allows manual entry and displays an error message if the entered Tax ID/Business Place is incorrect.

**Scenario: Validating Salesman Code against Dealer Code:**

13. **Salesman Code Validation:**
    - *Scenario:* User enters a Salesman Code identical to the Dealer Code.
    - *Test Case:* Ensure that the system displays an error message indicating that the Salesman Code should not be the same as the Dealer Code.

**Scenario: Auto-Population of Payment Due Days:**

14. **Selecting Payment Term:**
    - *Scenario:* User selects a Payment Term from the dropdown.
    - *Test Case:* Verify that selecting a Payment Term auto-populates the Payment Due Days field and makes it unchangeable.

**Scenario: SAP Fields Data Entry and Validation:**

15. **Entering SAP Fields Data:**
    - *Scenario:* User manually enters data in SAP fields (Asset No, Purchase Reqn No, Cost Center Charge, SAP Budget No., Term (Years), WBS).
    - *Test Case:* Confirm that the system allows manual entry, and check whether there's a need for API calls for validation.

**Scenario: Email Field Functionality:**

16. **Entering Valid Email:**
    - *Scenario:* User enters a valid email address fetched from Customer Master Maintenance.
    - *Test Case:* Verify that the system accepts the valid email address.

17. **Entering Invalid Email:**
    - *Scenario:* User enters an email address with missing '@' or '.' or contains special characters.
    - *Test Case:* Confirm that the system displays a warning message for invalid email format.

**Scenario: Vehicle Details Table Enhancement:**

18. **Adding Booking No. and Customer Name Columns:**
    - *Scenario:* User navigates to the Vehicle details table.
    - *Test Case:* Ensure that Booking No. and Customer Name columns are added along with Series and Model/Suffix.

19. **Link to Matched Data Screen:**
    - *Scenario:* User clicks on the link in the Vehicle details section.
    - *Test Case:* Confirm that the system redirects to the Matched Data Screen, and the vehicle-related data is fetched from there.

20. **Pagination in Vehicle Details Table:**
    - *Scenario:* More than 20 records in the Vehicle details table.
    - *Test Case:* Verify that pagination is maintained, displaying 10 or 20 records per page.

21. **Search Criteria and Multiselect Dropdown in Vehicle Details:**
    - *Scenario:* User utilizes search criteria and multiselect dropdown in the Vehicle details section.
    - *Test Case:* Confirm the presence and functionality of search criteria, multiselect dropdown, and sorting in the table list.

22. **Checkbox Selection in Vehicle Details Table:**
    - *Scenario:* User selects checkboxes for specific vehicles.
    - *Test Case:* Validate that selected records are displayed at the top of the list.

**Scenario: Screen Button Modifications:**

23. **Removing Vehicle List Button:**
    - *Scenario:* User navigates through the screen.
    - *Test Case:* Ensure that the Vehicle List button is removed in the new system.

24. **Enabling Leasing Customer Details:**
    - *Scenario:* User selects the checkbox for leasing customer details.
    - *Test Case:* Confirm that Leasing Customer Details are enabled when the checkbox is selected.

25. **Removing Print Invoice Button and Adding Preview Button:**
    - *Scenario:* User navigates through the screen.
    - *Test Case:* Ensure that the Print Invoice button is removed, and a Preview button is added. Verify that the Issue Invoice is enabled only after clicking Preview.

**Scenario: W/S Selling Price Field Functionality:**

26. **Entering Vehicle Details and Editing W/S Selling Price:**
    - *Scenario:* User enters vehicle details in the table.
    - *Test Case:* Confirm that the W/S Selling Price field gets populated and is editable.

**Scenario: Fetching Price Details from Price Master Maintenance:**

27. **Clicking on

28. ---

Certainly! Let's break down each step and create specific test case scenarios and test cases for better clarity.

**Step 1: Accessing Direct Sales Invoice Issuing Screen:**
   
   - *Scenario:* Admin logs in and navigates to Invoicing and Registration -> Invoicing -> Direct Sales Invoice Issuing.
   - *Test Case:* Confirm that the admin can successfully access the Direct Sales Invoice Issuing screen.

   - *Scenario:* TMT/SN user logs in and navigates to Invoicing and Registration -> Invoicing -> Direct Sales Invoice Issuing.
   - *Test Case:* Ensure that the TMT/SN user can successfully access the Direct Sales Invoice Issuing screen.

**Step 2: Salesman Code Functionality:**

   - *Scenario:* User enters a valid Salesman Code.
   - *Test Case:* Verify that entering a valid Salesman Code auto-populates the Salesman Name from the Salesman Resume master form.

   - *Scenario:* User starts typing the first 2-3 numbers of the Salesman Code in the dropdown.
   - *Test Case:* Confirm that a dropdown appears, populating records based on the search in the dropdown.

**Step 3: Customer Details Functionality:**

   - *Scenario:* User enters a valid Customer Code.
   - *Test Case:* Verify that entering a valid Customer Code auto-populates related fields (Customer Name (Eng), Customer Name (Thai), Address, District, Sub-District, Province) from the Customer Master Maintenance form.

   - *Scenario:* User clicks on the Zip Code field.
   - *Test Case:* Confirm that the system provides functionality to select a zip code based on the district in the future.

   - *Scenario:* User selects the Customer Code field.
   - *Test Case:* Ensure that the Customer Code field type is changed from text to a smart dropdown, populating data from the Customer Master Maintenance form.

   - *Scenario:* User leaves the Zip Code field empty.
   - *Test Case:* Validate that the system prompts the user to fill the mandatory Zip Code field in the Customer Details section.

**Step 4: Handling Without VAT Flag:**

   - *Scenario:* User selects the "Without VAT" checkbox.
   - *Test Case:* Verify that selecting the checkbox flags the Without VAT field as read-only, denoting that the customer does not require VAT.

**Step 5: Employee Code Entry and Dealer Field Removal:**

   - *Scenario:* User manually enters an Employee Code.
   - *Test Case:* Confirm that the system allows the user to manually input the Employee Code.

   - *Scenario:* User navigates through the fields.
   - *Test Case:* Ensure that the Dealer field is removed from the screen in the new system.

**Step 6: Business Place and Tax ID Handling:**

   - *Scenario:* User manually enters Business Place and Tax ID for specific Customer Codes.
   - *Test Case:* Confirm that the system allows manual entry and displays an error message if the entered Tax ID/Business Place is incorrect.

**Step 7: Validating Salesman Code against Dealer Code:**

   - *Scenario:* User enters a Salesman Code identical to the Dealer Code.
   - *Test Case:* Ensure that the system displays an error message indicating that the Salesman Code should not be the same as the Dealer Code.

**Step 8: Auto-Population of Payment Due Days:**

   - *Scenario:* User selects a Payment Term from the dropdown.
   - *Test Case:* Verify that selecting a Payment Term auto-populates the Payment Due Days field and makes it unchangeable.

**Step 9: SAP Fields Data Entry and Validation:**

   - *Scenario:* User manually enters data in SAP fields (Asset No, Purchase Reqn No, Cost Center Charge, SAP Budget No., Term (Years), WBS).
   - *Test Case:* Confirm that the system allows manual entry, and check whether there's a need for API calls for validation.

**Step 10: Email Field Functionality:**

   - *Scenario:* User enters a valid email address fetched from Customer Master Maintenance.
   - *Test Case:* Verify that the system accepts the valid email address.

   - *Scenario:* User enters an email address with missing '@' or '.' or contains special characters.
   - *Test Case:* Confirm that the system displays a warning message for an invalid email format.

**Step 11: Vehicle Details Table Enhancement:**

   - *Scenario:* User navigates to the Vehicle details table.
   - *Test Case:* Ensure that Booking No. and Customer Name columns are added along with Series and Model/Suffix.

   - *Scenario:* User clicks on the link in the Vehicle details section.
   - *Test Case:* Confirm that the system redirects to the Matched Data Screen, and the vehicle-related data is fetched from there.

   - *Scenario:* More than 20 records in the Vehicle details table.
   - *Test Case:* Verify that pagination is maintained, displaying 10 or 20 records per page.

   - *Scenario:* User utilizes search criteria and multiselect dropdown in the Vehicle details section.
   - *Test Case:* Confirm the presence and functionality of search criteria, multiselect dropdown, and sorting in the table list.

   - *Scenario:* User selects checkboxes for specific vehicles.
   - *Test Case:* Validate that selected records are displayed at the top of the list.

**Step 12: Screen Button Modifications:**

   - *Scenario:* User navigates through the screen.
   - *Test Case:* Ensure that the Vehicle List button is removed in the new system.

   - *Scenario:* User selects the checkbox for leasing customer details.
   - *Test Case:* Confirm that Leasing Customer Details are enabled when the checkbox is selected.

   - *Scenario:* User navigates through the screen.
   - *Test Case:* Ensure that the Print Invoice button is removed, and a Preview button is added. Verify that the Issue Invoice is enabled only after clicking Preview.

**Step 13: W/S Selling Price Field Functionality:**

   - *Scenario:* User enters vehicle details in the table.
   - *Test Case:* Confirm that the W/S Selling Price field gets populated and is editable.

**Step 14: Fetching Price Details from Price Master Maintenance:**

   - *Scenario:* User clicks on the "Get Price" button in the Vehicle details section.
   - *Test Case:* Confirm that the system fetches the price details from the Price Master Maintenance form and updates the relevant fields.

**Step 15: SAP Integration for Issuing Invoice:**

   - *Scenario:* User clicks on the "Issue Invoice" button after completing all details.
   - *Test Case:* Verify that the details related to issuing the invoice are sent to the SAP system.

These detailed test case scenarios and test cases cover each step of the provided information for the "Direct Sales Invoice Issuing" screen. They aim to ensure thorough testing of the specified functionality and behavior of the system.
