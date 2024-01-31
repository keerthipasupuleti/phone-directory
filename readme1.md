/*
   Name           :  FP_TBR_WHN_NEW_FRM_INSTNC
   
   Module         :  TBR

   Purpose        :  Selects the System date and the User
                     
   Calls          :  None
                   
   Returns        :  Null

   Steps Involved :  Selects the System Date and User, if not found raises appropriate 
                     alert messages
                  
   History        :

   Author          Date               What
   ------          ----               ----
   Shaily          27/02/2004         1.0
   Amrinder				 06/09/2011         Changed Version to 1.0 for TBR Migration
*/

PROCEDURE FP_TBR_WHN_NEW_FRM_INSTNC IS
   l_v_version      TBR_PROG_DTLS.TPD_VERSION1%TYPE := '1.0';
   l_v_mod_nm       TBR_ERR_MST.EM_MOD_NM%TYPE;
   l_v_err_cd       TBR_ERR_MST.EM_ERR_CD%TYPE;
   l_v_prog_id      TBR_PROG_DTLS.TPD_PROG_ID%TYPE := GET_APPLICATION_PROPERTY(CURRENT_FORM_NAME);
   l_v_ret_typ      TBR_ERR_MST.EM_ERR_TYP%TYPE;
BEGIN

   :GLOBAL.SM_ID := :GLOBAL.SM_ID;
   IF :GLOBAL.G_C_ERR = 'T' THEN
      EXIT_FORM;
   END IF;

   LP_TBR016_WINPROC_INV('INV', :GLOBAL.WIN_TYP, 'LTD Color Master Maintenance (FINV60180 Ver ' || l_v_version || ')');

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
                                    ,l_v_ret_typ
                                   );
   
      WHEN TOO_MANY_ROWS THEN
         LP_TBR013_PRCDR_ERR_HNDLR ('TBR'
                                    ,'01072'
                                    ,l_v_ret_typ
                                   );
      WHEN OTHERS THEN
         LP_TBR014_OTH_EXCPTNS;
   END;

   BEGIN
      :B01_GLOBAL.NBT_US := :B01_GLOBAL.NBT_USER;
      :B01_GLOBAL.NBT_DT := :B01_GLOBAL.NBT_SYSDATE;
   END;
   
   -- TBR VI (Rel-4) version control  starts 

   --Commented by Amrinder on 06/09/2011 for TBR Migration - Start
   /*
   LP_DNS013_CHECK_VERSION (l_v_prog_id,
                            l_v_version,
                            l_v_mod_nm,
                            l_v_err_cd  
                           );
                              
   IF l_v_err_cd <> '00000' THEN
      LP_TBR013_PRCDR_ERR_HNDLR (l_v_mod_nm, l_v_err_cd, l_v_ret_typ);
      EXIT_FORM(NO_VALIDATE);
   END IF;
   */
   --Commented by Amrinder on 06/09/2011 for TBR Migration - End
   
   -- TBR VI (Rel-4) version control  ends

   GO_BLOCK('B02_INV_LTD_CLR_MST');
   EXECUTE_QUERY;
END;
------

The `FP_TBR_WHN_NEW_FRM_INSTNC` procedure for the "LTD Color Master Maintenance" screen appears to serve a similar purpose to the previous procedures we discussed. Let's break down the key steps and objectives:

### `FP_TBR_WHN_NEW_FRM_INSTNC` Procedure:

#### 1. **Initialization and Declaration:**
```plsql
PROCEDURE FP_TBR_WHN_NEW_FRM_INSTNC IS
   l_v_version      TBR_PROG_DTLS.TPD_VERSION1%TYPE := '1.0';
   l_v_mod_nm       TBR_ERR_MST.EM_MOD_NM%TYPE;
   l_v_err_cd       TBR_ERR_MST.EM_ERR_CD%TYPE;
   l_v_prog_id      TBR_PROG_DTLS.TPD_PROG_ID%TYPE := GET_APPLICATION_PROPERTY(CURRENT_FORM_NAME);
   l_v_ret_typ      TBR_ERR_MST.EM_ERR_TYP%TYPE;
BEGIN
```
   - **Explanation:**
      - The procedure is declared with local variables.
      - It initializes variables for program version, module name, error code, program ID, and error type.

#### 2. **Form Exit Check:**
```plsql
   :GLOBAL.SM_ID := :GLOBAL.SM_ID;
   IF :GLOBAL.G_C_ERR = 'T' THEN
      EXIT_FORM;
   END IF;
```
   - **Explanation:**
      - Assigns the global `SM_ID` to itself (no apparent impact).
      - Checks if `G_C_ERR` is set to 'T'. If true, it exits the form.

#### 3. **Module Name and Window Processing:**
```plsql
   LP_TBR016_WINPROC_INV('INV', :GLOBAL.WIN_TYP, 'LTD Color Master Maintenance (FINV60180 Ver ' || l_v_version || ')');
```
   - **Explanation:**
      - Calls a procedure `LP_TBR016_WINPROC_INV` with parameters related to module, window type, and a formatted window title.

#### 4. **System Information Retrieval:**
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
                                    ,l_v_ret_typ
                                   );
      WHEN TOO_MANY_ROWS THEN
         LP_TBR013_PRCDR_ERR_HNDLR ('TBR'
                                    ,'01072'
                                    ,l_v_ret_typ
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

#### 7. **Block Navigation and Query Execution:**
```plsql
   -- TBR VI (Rel-4) version control starts 

   -- Commented out section for program version validation
   
   GO_BLOCK('B02_INV_LTD_CLR_MST');
   EXECUTE_QUERY;
END;
```
   - **Explanation:**
      - There is a commented-out block related to program version validation.
      - Navigates to a specific block named 'B02_INV_LTD_CLR_MST'.
      - Executes a query in that block.

This procedure is likely responsible for initializing the "LTD Color Master Maintenance" screen, including setting up global variables, fetching system information, and potentially executing a query. The commented-out sections suggest that certain parts of the code, like program version validation, may be subject to customization or modification based on specific requirements.
