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
4.	Customer code field type needs to be changed from text to smart dropdown and the data come from Customer Master Maintenance form.
5.	Once user enters Customer Code other fields related to customer (Customer Name (Eng) , Customer Name (Thai),Adress, District, Sub-District, Province ) should be auto populated. As per current functionality user can enter Zip code manually. However, in future there can be a new screen once user clicks on Zip code field to select zip code based on district. 
6.	Without Vat should be read only field in new system. We can use it as a flag. This data come from Customer Master Maintenance form. If user would have selected check box for Without VAT, then it denotes that specific customer does not require VAT.
7.	Emp code will be manually entered by the user. Emp Code should be enabled based on select Specific Customer Code 
8.	Dealer field will be removed in the new system.
9.	For some Customer Code Business Place and Tax Id fields should be manually entered and for some Customer Code it will be automatically Populated. If the entered Tax Id/ Business Place is wrong, then system should display error message.
10.	Zip code should be a mandatory field in Customer details section.
11.	When user selects Payment Term from drop down, then Payment due days field will be auto populated and cannot be changed.
12.Other fields from Payment Term Details section (Asset No, Purchase Reqn No, Cost     Center Charge, SAP Budget No., Term (Years), WBS ) come from SAP and  user can enter the data  manually. Currently we do not have any field validation to check whether the user have entered the correct data or not. Business will check whether any API call is required for validation or not.
1.	Add Booking no. and customer name column in the Vehicle details table along with the existing columns.
2.	There will be a link on Vehicle details section to redirect to Matched Data Screen and the vehicle related data should come from there.
3.	If there are more than 20 records in Vehicle details table, then we need to maintain the pagination and each page we can have 10/20 records. 
4.	Add search criteria section with Booking No and Company Name field along with search button. Also add multiselect dropdown for other columns. Sorting functionality should be there in table list as well. 
5.	Check boxes need to be there in the table list to select specific vehicles. Once user select checkbox, the select records can be on the top of the list. 
6.	Vehicle list button should be removed in the new system.
7.	Leasing Customer Details can be enabled once user selects the checkbox.
8.	Print Invoice button not required and can be removed. 
9.	Need a Preview button in place of Print Invoice. Once user clicks on it then only Issue invoice will be enabled
10.	Once user enter Vehicle details in table then W/S Selling Price field will get populated, and user can also edit it.
11.	Get Price details come from Price Master Maintenance form.
12.	Details related to Issue Invoice should be sed to SAP system.
--------------------
3.	Series Man Invoice Issuing for Incomplete/Hold Car screen can be accessed by Admin and TMT/SN
4.	Select radio button for Issues from Inquiry section. Remove Inquiry radio button. 
5.	Based on the selection of different customer code in Inquiry section on Series Man Invoice Issuing for Incomplete/Hold Car screen the Customer Name should be changed in Customer details section
6.	Delete type from Vehicle list and Print Invoice from the screen.
7.	Add Preview button in place of Print Invoice button.
8.	We can have Series Man Invoice Issuing for Incomplete/Hold Car and Direct Sales Invoice Issuing in a single screen having two different tabs. As user roles are different for these two screens, so there should be restriction for both the users. Users can access the screen based on their roles.
9.	Issue Credit Note screen can be accessed by Admin and TMT/Sales Planner 
10.	Enter Invoice No. in Invoice No. text field under Inquiry section and click on execute button other fields should get auto populated and click on Issue Credit Note button to generate a Credit Note.
11.	When user finds that he did some mistakes in Credit Note and he wants to cancel it then he needs to follow the below steps:
a)	Enter Credit Note No. in the Credit Note No. text field and select Price radio button. 
b)	Select reason of Cancellation from Cancel Reason drop down field.
c)	Click on Cancel Credit Note button. Credit Note should get cancelled.  
