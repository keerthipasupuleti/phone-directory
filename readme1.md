/*
   Name           :  FP_TBR_WHN_NEW_FRM_INSTNC
   
   Module         :  INV

   Purpose        :  Selects the System date and the User
                     
   Calls          :  None
                   
   Returns        :  Null

   Steps Involved :  Selects the System Date and User, if not found raises appropriate 
                     alert messages
                  
   History        :
   Author          Date               What
   ------          ----               ----
   Manish          26/02/2004         1.0
   Rahul           22/10/2009         To allow input char in Fuel code column.
                                      It updated in property of field 
   Amrinder				 06/09/2011	        Changed Version to 1.0 for TBR Migration                              
*/

PROCEDURE FP_TBR_WHN_NEW_FRM_INSTNC IS

   l_v_ret_type     VARCHAR2(1);
   l_v_mod_nm       TBR_ERR_MST.EM_MOD_NM%TYPE;
   l_v_err_cd       TBR_ERR_MST.EM_ERR_CD%TYPE;
   l_n_status       NUMBER;
   -- Variable for Version control
-- l_v_version      TBR_PROG_DTLS.TPD_VERSION1%TYPE := '5.3';
-- l_v_version      TBR_PROG_DTLS.TPD_VERSION1%TYPE := '5.4'; --Added by Rahul on 22-Oct-2009
   l_v_version      TBR_PROG_DTLS.TPD_VERSION1%TYPE := '1.0'; --Added by Amrinder on 06-sep-2011
   l_v_prog_id      TBR_PROG_DTLS.TPD_PROG_ID%TYPE := GET_APPLICATION_PROPERTY(CURRENT_FORM_NAME);

BEGIN
   :GLOBAL.SM_ID := :GLOBAL.SM_ID;
   IF :GLOBAL.G_C_ERR = 'T' THEN
      EXIT_FORM;
   END IF;

   --MODULE NAME = D&S/DLR/VSC/INV
   LP_TBR016_WINPROC_INV('INV',:GLOBAL.WIN_TYP,'Fuel Type Master Maintenance (FINV60175 Ver ' || l_v_version ||')'); 

   BEGIN
      SELECT  SYSDATE, 
              USER
      INTO    :B01_GLOBAL.NBT_SYSDATE, 
              :B01_GLOBAL.NBT_USER
      FROM    SYS.DUAL;
   EXCEPTION
   
      WHEN NO_DATA_FOUND THEN
         LP_TBR013_PRCDR_ERR_HNDLR ('TBR'
                                    ,'01071'
                                    ,l_v_ret_type
                                   );
   
      WHEN TOO_MANY_ROWS THEN
         LP_TBR013_PRCDR_ERR_HNDLR ('TBR'
                                    ,'01072'
                                    ,l_v_ret_type
                                   );
      WHEN OTHERS THEN
         LP_TBR014_OTH_EXCPTNS;
   END;

   BEGIN
      :B01_GLOBAL.NBT_US := :B01_GLOBAL.NBT_USER;
      :B01_GLOBAL.NBT_DT := :B01_GLOBAL.NBT_SYSDATE;
   END;

   /* This code block will check/validate the Program Version of this program from the TBR Database.
      If the version is validated, the system will allow the user to work with the current program,
      otherwise it will exit.
   */
 
   --Commented by Amrinder on 06/09/2011 for TBR Migration - Start
   /*
   LP_DNS013_CHECK_VERSION (l_v_prog_id,
                            l_v_version,
                            l_v_mod_nm,
                            l_v_err_cd  
                           );
                              
   IF l_v_err_cd <> '00000' THEN
      LP_TBR013_PRCDR_ERR_HNDLR (l_v_mod_nm, l_v_err_cd, l_v_ret_type);
      EXIT_FORM(NO_VALIDATE);
   END IF;
   */
	--Commented by Amrinder on 06/09/2011 for TBR Migration - End

   IF :PARAMETER.P_I_N_FLG != 'Y' AND :SYSTEM.BLOCK_STATUS <> 'CHANGED' THEN
      EXECUTE_QUERY;
   END IF;

   :PARAMETER.P_I_N_FLG := 'N';


END;		

---------------
/*
   Name           :  FP_TBR_BUTTN_PRC
   
   Module         :  TBR

   Purpose        :  This is a generic button procedure. It reads the NAME of the button and 
                     performs a DO_KEY(item_name).
                     Regarding QUERY-operation:
                      * if there are buttons called EXECUTE_QUERY and CANCEL_QUERY, this 
                        function shows them 
                      * when the ENTER_QUERY button is pressed and hides them
                      * when EXECUTE_QUERY or CANCEL_QUERY is pressed. 
                      * No error should be returned if these buttons do not exist.
                     To make naming of the buttons easier, EXIT, QUIT and EXIT_FORM all perform 
                     exit_form, even if the form is in ENTER-QUERY mode !!!!!!!
                     A CANCEL_QUERY button-name cancels a currently "open" query.
 

   Calls          :  Standard procedures

   Returns        :  Null

   Steps Involved :  Get the Itemname of the button pressed and perform DO_KEY(item_name).

   History        :
   Author          Date               What
   ------          ----               ----
   Designer/2000   01/09/1998         1.0
*/

   PROCEDURE FP_TBR_BUTTN_PRC IS
      l_v_action       VARCHAR2(80);

   BEGIN    
      l_v_action := GET_ITEM_PROPERTY(NAME_IN('SYSTEM.TRIGGER_ITEM')
                                     ,ITEM_NAME
                                    );
      IF l_v_action IN ('EXIT_FORM', 'EXIT','QUIT') 
      THEN
         l_v_action := 'EXIT_FORM';
         IF NAME_IN('SYSTEM.MODE')='ENTER-QUERY' 
         THEN
            DO_KEY('EXIT_FORM');
            l_v_action := 'EXIT_FORM';
         END IF;
      END IF;
      IF l_v_action = 'CANCEL_QUERY'
      THEN
         IF NAME_IN('SYSTEM.MODE')='ENTER-QUERY' 
	   THEN
            l_v_action := 'EXIT_FORM';
         ELSE
            l_v_action := '';
         END IF;
      END IF;

      IF l_v_action = 'CUT_REGION'
      THEN
         CUT_REGION;
      ELSIF l_v_action = 'COPY_REGION'
      THEN
         COPY_REGION;
      ELSIF l_v_action = 'PASTE_REGION'
      THEN
         PASTE_REGION;
      ELSIF l_v_action = 'FTR_PRINT'
      THEN
         EXECUTE_TRIGGER('FTR_TBR_PRINT');
      ELSIF 
         l_v_action IS NOT NULL
      THEN
         DO_KEY(l_v_action);
      END IF;

END;
