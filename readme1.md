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

---
Absolutely, let's break down the `FP_TBR_WHN_NEW_FRM_INSTNC` procedure step by step:

### `FP_TBR_WHN_NEW_FRM_INSTNC` Procedure:

#### 1. **Initialization and Declaration:**
```plsql
PROCEDURE FP_TBR_WHN_NEW_FRM_INSTNC IS
   l_v_ret_type     VARCHAR2(1);
   l_v_mod_nm       TBR_ERR_MST.EM_MOD_NM%TYPE;
   l_v_err_cd       TBR_ERR_MST.EM_ERR_CD%TYPE;
   l_n_status       NUMBER;
   l_v_version      TBR_PROG_DTLS.TPD_VERSION1%TYPE := '1.0';
   l_v_prog_id      TBR_PROG_DTLS.TPD_PROG_ID%TYPE := GET_APPLICATION_PROPERTY(CURRENT_FORM_NAME);
BEGIN
```
   - **Explanation:**
      - The procedure is declared and initialized with local variables.
      - `l_v_ret_type`, `l_v_mod_nm`, and `l_v_err_cd` are used for error handling.
      - `l_n_status` is a numeric variable.
      - `l_v_version` is initialized to the program version '1.0'.
      - `l_v_prog_id` gets the current form's ID.

#### 2. **Form Exit Check:**
```plsql
   :GLOBAL.SM_ID := :GLOBAL.SM_ID;
   IF :GLOBAL.G_C_ERR = 'T' THEN
      EXIT_FORM;
   END IF;
```
   - **Explanation:**
      - Assigns the global `SM_ID` to itself (doesn't seem to have any impact).
      - Checks if `G_C_ERR` is set to 'T'. If true, it exits the form.

#### 3. **Module Name and Window Processing:**
```plsql
   LP_TBR016_WINPROC_INV('INV',:GLOBAL.WIN_TYP,'Fuel Type Master Maintenance (FINV60175 Ver ' || l_v_version ||')');
```
   - **Explanation:**
      - Calls a procedure `LP_TBR016_WINPROC_INV` with parameters related to module, window type, and a formatted window title.

#### 4. **System Date and User Retrieval:**
```plsql
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
```
   - **Explanation:**
      - Executes a SQL query to fetch the system date and user from `SYS.DUAL`.
      - Handles potential exceptions like `NO_DATA_FOUND` and `TOO_MANY_ROWS`, triggering specific error handlers.
      - If any other exception occurs, it falls back to a generic error handler.

#### 5. **Additional User and Date Assignment:**
```plsql
   BEGIN
      :B01_GLOBAL.NBT_US := :B01_GLOBAL.NBT_USER;
      :B01_GLOBAL.NBT_DT := :B01_GLOBAL.NBT_SYSDATE;
   END;
```
   - **Explanation:**
      - Assigns user and system date to additional global variables.

#### 6. **Program Version Validation (Commented Out):**
```plsql
   -- Commented out section for program version validation
```
   - **Explanation:**
      - There is a commented-out block related to program version validation.

#### 7. **Query Execution and Parameter Reset:**
```plsql
   IF :PARAMETER.P_I_N_FLG != 'Y' AND :SYSTEM.BLOCK_STATUS <> 'CHANGED' THEN
      EXECUTE_QUERY;
   END IF;
   :PARAMETER.P_I_N_FLG := 'N';
END;
```
   - **Explanation:**
      - Executes a query if certain conditions are met (not in query mode and block status not changed).
      - Resets a parameter if conditions allow query execution.

This procedure primarily handles initialization tasks, including fetching system date and user, performing program version validation, and potentially executing a query. It incorporates error handling mechanisms throughout.

--


In the provided PL/SQL code snippet, `:PARAMETER.P_I_N_FLG` appears to be a reference to an Oracle Forms parameter named `P_I_N_FLG`. 

Let's break down its usage in the code:

```plsql
IF :PARAMETER.P_I_N_FLG != 'Y' AND :SYSTEM.BLOCK_STATUS <> 'CHANGED' THEN
   EXECUTE_QUERY;
END IF;
:PARAMETER.P_I_N_FLG := 'N';
```

Here's what each part does:

1. **Condition Check:**
   - `IF :PARAMETER.P_I_N_FLG != 'Y' AND :SYSTEM.BLOCK_STATUS <> 'CHANGED' THEN`
   - Checks if the parameter `P_I_N_FLG` is not equal to 'Y' and the block status of the form is not changed.

2. **Query Execution:**
   - `EXECUTE_QUERY;`
   - If the condition is met, it executes a query.

3. **Parameter Reset:**
   - `:PARAMETER.P_I_N_FLG := 'N';`
   - Regardless of whether the condition is met or not, it sets the parameter `P_I_N_FLG` to 'N' after the query execution.

In the context of Oracle Forms, parameters are used to pass values between forms, triggers, and procedures. In this case, `P_I_N_FLG` seems to be a flag that controls whether a query should be executed, and after the query is executed, it resets the flag to 'N'. The exact purpose of this flag would depend on the broader functionality and design of the Oracle Forms application you are working with.

--
Certainly, let's break down the `FP_TBR_BUTTN_PRC` procedure step by step:

### `FP_TBR_BUTTN_PRC` Procedure:

#### 1. **Declaration:**
```plsql
   PROCEDURE FP_TBR_BUTTN_PRC IS
      l_v_action       VARCHAR2(80);
   BEGIN
```
   - **Explanation:**
      - The procedure is declared with a local variable `l_v_action` of type VARCHAR2(80).

#### 2. **Determine Button Action:**
```plsql
      l_v_action := GET_ITEM_PROPERTY(NAME_IN('SYSTEM.TRIGGER_ITEM')
                                     ,ITEM_NAME
                                    );
```
   - **Explanation:**
      - Determines the action associated with the pressed button using `GET_ITEM_PROPERTY`.
      - Retrieves the item name associated with the system trigger item.

#### 3. **Button Action Handling:**
```plsql
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
```
   - **Explanation:**
      - Handles specific actions based on button names:
         - If the action is 'EXIT_FORM', 'EXIT', or 'QUIT':
            - If the form is in ENTER-QUERY mode, it uses `DO_KEY('EXIT_FORM')`.
         - If the action is 'CANCEL_QUERY':
            - If the form is in ENTER-QUERY mode, it sets the action to 'EXIT_FORM'; otherwise, it sets the action to an empty string.

#### 4. **Additional Button Actions:**
```plsql
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
```
   - **Explanation:**
      - Handles additional actions based on the determined button action (`l_v_action`):
         - If it's 'CUT_REGION', it calls `CUT_REGION`.
         - If it's 'COPY_REGION', it calls `COPY_REGION`.
         - If it's 'PASTE_REGION', it calls `PASTE_REGION`.
         - If it's 'FTR_PRINT', it executes the trigger 'FTR_TBR_PRINT'.
         - If `l_v_action` is not null, it uses `DO_KEY` to perform the action.

#### 5. **Generic Button Handling:**
```plsql
END;
```
   - **Explanation:**
      - Ends the procedure, providing a generic mechanism for handling various button actions consistently throughout the application.

#### Additional Comments:

- The procedure provides a flexible way to handle button actions within an Oracle Forms application.
- It uses `GET_ITEM_PROPERTY` to determine the action associated with the pressed button.
- Specific actions like 'EXIT_FORM', 'CANCEL_QUERY', and others are handled according to the application's logic.

This procedure acts as a central component for interpreting button actions, making it easier to maintain consistent behavior across different buttons in the application.
