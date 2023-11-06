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
