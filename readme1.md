PROCEDURE FP_TBR_WHN_NEW_FRM_INSTNC IS
   l_v_ret_type     VARCHAR2(1);
   l_v_mod_nm       TBR_ERR_MST.EM_MOD_NM%TYPE;
   l_v_err_cd       TBR_ERR_MST.EM_ERR_CD%TYPE;
   l_n_status       NUMBER;
   -- Variable for Version control
   l_v_version      TBR_PROG_DTLS.TPD_VERSION1%TYPE := '1.0';
   l_v_prog_id      TBR_PROG_DTLS.TPD_PROG_ID%TYPE := GET_APPLICATION_PROPERTY(CURRENT_FORM_NAME);
BEGIN
   :GLOBAL.SM_ID := :GLOBAL.SM_ID;
   IF :GLOBAL.G_C_ERR = 'T' THEN
      EXIT_FORM;
   END IF;

   LP_TBR016_WINPROC_INV('INV',:GLOBAL.WIN_TYP,'VAT Master Maintenance (FINV60155 Ver ' || l_v_version ||')'); 

   BEGIN
      SELECT  SYSDATE, 
              USER
      INTO    :B01_GLOBAL.NBT_SYSDATE, 
              :B01_GLOBAL.NBT_USER
      FROM    SYS.DUAL;
   EXCEPTION
      WHEN NO_DATA_FOUND THEN
         LP_TBR013_PRCDR_ERR_HNDLR ('TBR','01071',l_v_ret_type);

      WHEN TOO_MANY_ROWS THEN
         LP_TBR013_PRCDR_ERR_HNDLR ('TBR','01072',l_v_ret_type);
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

   --Commented by Amarinder on 05/09/2011 for TBR Migration - Start
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
   --Commented by Amarinder on 05/09/2011 for TBR Migration - End
   EXECUTE_QUERY;
END;
