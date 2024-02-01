/*
   Name           :  FP_INV_POPULATE_LISTS
   
   Module         :  INV

   Purpose        :  To Populate Payment Term List and Series Lists
                     
   Calls          :  Null
                   
   Returns        :  Null

   Steps Involved :  Check A.) Clear payment type list and create Recordgroup using DS_CODE_MST Table
                     Check B.) Populate Payment Type List using record Group created in step A.
                     
   History        :
   Author          Date               What
   ------          ----               ----
   Gagan           24/11/2003         1.0
*/



PROCEDURE FP_INV_POPULATE_LISTS IS
   l_rg_reason_type    RECORDGROUP;
   l_n_status          NUMBER;
   l_v_qry             VARCHAR2(2000);
   l_v_ret_type        TBR_ERR_MST.EM_ERR_TYP%TYPE;
   l_v_mod_nm          TBR_ERR_MST.EM_MOD_NM%TYPE;
   l_v_err_cd          TBR_ERR_MST.EM_ERR_CD%TYPE;
BEGIN
   /*Check A.) Clear payment type list and create Recordgroup using DS_CODE_MST Table*/
   CLEAR_LIST('B02_INV_DOC_HDR.NBT_REASON_CD');

   l_rg_reason_type := FIND_GROUP('reason_type_rg'); 
   IF NOT Id_Null(l_rg_reason_type) THEN 
      DELETE_GROUP(l_rg_reason_type); 
   END IF; 

   l_v_qry := 'SELECT  CDM_CD'||'||'||''''||' '||''''||'||'||'CDM_DESC CDM_CD, CDM_CD  FROM DS_CODE_MST WHERE CDM_CD_TYP = '||''''||'RSN'||''''||'  AND CDM_RSN_TYP = '||''''||'I'||''''
               ||' ORDER BY CDM_RPT_SEQ ';
   l_rg_reason_type := CREATE_GROUP_FROM_QUERY ('reason_type_rg',l_v_qry);
   l_n_status := POPULATE_GROUP('reason_type_rg');
   -- Check if population has been successful

   IF l_n_status <> 0 THEN
       LP_TBR013_PRCDR_ERR_HNDLR('INV','20605',l_v_ret_type);
   END IF;
   IF l_n_status = 0 THEN
      POPULATE_LIST('B02_INV_DOC_HDR.NBT_REASON_CD',l_rg_reason_type);
   END IF;
EXCEPTION
   WHEN OTHERS THEN
      LP_TBR014_OTH_EXCPTNS;
END;

----------------

/*
   Name           :   FP_INV_POPULATE_LIST_REISSUE
   
   Module         :  INV

   Purpose        :  To Populate Reason Code for reissue case
                     
   Calls          :  Null
                   
   Returns        :  Null

   Steps Involved :  Check A.) Clear payment type list and create Recordgroup using DS_CODE_MST Table
                     Check B.) Populate Payment Type List using record Group created in step A.
                     
   History        :
   Author          Date               What
   ------          ----               ----
   Gagan           24/11/2003         1.0
*/



PROCEDURE FP_INV_POPULATE_LIST_REISSUE IS
   l_rg_reason_type    RECORDGROUP;
   l_n_status          NUMBER;
   l_v_qry             VARCHAR2(2000);
   l_v_ret_type        TBR_ERR_MST.EM_ERR_TYP%TYPE;
   l_v_mod_nm          TBR_ERR_MST.EM_MOD_NM%TYPE;
   l_v_err_cd          TBR_ERR_MST.EM_ERR_CD%TYPE;
BEGIN
   /*Check A.) Clear payment type list and create Recordgroup using DS_CODE_MST Table*/
   CLEAR_LIST('B02_INV_DOC_HDR.NBT_REASON_CD');

   l_rg_reason_type := FIND_GROUP('reason_type_rg'); 
   IF NOT Id_Null(l_rg_reason_type) THEN 
      DELETE_GROUP(l_rg_reason_type); 
   END IF; 

   l_v_qry := 'SELECT  CDM_CD'||'||'||''''||' '||''''||'||'||'CDM_DESC CDM_CD, CDM_CD  FROM DS_CODE_MST WHERE CDM_CD_TYP = '||''''||'RSN'||''''||'  AND CDM_RSN_TYP = '||''''||'I'||''''
               ||' AND CDM_CD = NVL('||''''||:B02_INV_DOC_HDR.IH_RSN_CD||''''||', CDM_CD) ORDER BY CDM_RPT_SEQ ';
   l_rg_reason_type := CREATE_GROUP_FROM_QUERY ('reason_type_rg',l_v_qry);
   l_n_status := POPULATE_GROUP('reason_type_rg');
   -- Check if population has been successful

   IF l_n_status <> 0 THEN
       LP_TBR013_PRCDR_ERR_HNDLR('INV','20605',l_v_ret_type);
   END IF;
   IF l_n_status = 0 THEN
      POPULATE_LIST('B02_INV_DOC_HDR.NBT_REASON_CD',l_rg_reason_type);
   END IF;
EXCEPTION
   WHEN OTHERS THEN
      LP_TBR014_OTH_EXCPTNS;
END;
---
/*
   Name           :  FP_INV_REISSUE_INV
   
   Module         :  INV

   Purpose        :  To insert a record in inv_hdr and inv_dtl .   
                  
   Calls          :  Null
                   
   Returns        :  Null

   Steps Involved :  
                     
   History        :
   Author          Date               What
   ------          ----               ----
   Gagan           25/11/2003         1.0
   Rohit           02/01/2004         TBR VI Rel-3 IT-1. Issue No: 22
   Rohit           07/07/2004         TBR VI ODC. Issue No: 151.
                                      Remove nowait as it is conflicting with sp_sin60000 batch.
*/


PROCEDURE FP_INV_REISSUE_INV IS
BEGIN
DECLARE
   l_d_sysdate    DATE;
   l_v_inv_no     VARCHAR2(10);
   l_n_cnt        NUMBER;
   l_n_new_inv_no INV_INV_CTRL.IC_VALUE%TYPE;
   l_v_reason_cd  INV_DOC_HDR.IH_RSN_CD%TYPE;
   l_v_temp       VARCHAR2(1);
   l_excep_lock    EXCEPTION;   
   PRAGMA EXCEPTION_INIT (l_excep_lock,-54);   /*to handle if row is locked*/
   l_v_ret_typ     VARCHAR2(1);
   --Start added by Nattanan 15/05/2015
   l_v_err_msg                  VARCHAR2(4000);
   L_N_ERR_CD										NUMBER;
   --End added by Nattanan 15/05/2015
BEGIN
   /***************TBR VI Rel-4 Onsite IT-1: 22 . Rohit Commented Code Starts***************/
-- Assigning the due date to d/b field
--   :B02_INV_DOC_HDR.IH_DUE_DT := :B02_INV_DOC_HDR.NBT_IH_DUE_DT;
   /***************TBR VI Rel-4 Onsite IT-1: 22 . Rohit Commented Code Ends***************/

   SELECT SYSDATE INTO l_d_sysdate 
   FROM DUAL;

   -- Select max + 1 from ctrl table, if record doesnot exist then insert the record else update

   SELECT TO_CHAR(l_d_sysdate,'YYYY')||LPAD(NVL(MAX(IC_VALUE),'0') + 1,6,'0'), COUNT(*),
   TO_NUMBER(NVL(MAX(IC_VALUE),0) + 1)
   INTO l_v_inv_no, l_n_cnt, l_n_new_inv_no   
   FROM INV_INV_CTRL
   WHERE IC_YEAR = TO_NUMBER(TO_CHAR(l_d_sysdate,'YYYY')) 
   AND   IC_TY = 'I';

   IF l_n_cnt = 0 THEN 
      INSERT INTO INV_INV_CTRL
      (
       IC_YEAR, 
       IC_TY, 
       IC_VALUE
      )
      VALUES
     (
      TO_CHAR(l_d_sysdate,'YYYY'),
      'I',
      l_n_new_inv_no
      );
   ELSIF l_n_cnt > 0 THEN 
   BEGIN
     SELECT TO_CHAR(l_d_sysdate,'YYYY')||LPAD((IC_VALUE+1), 6, '0'), 
            IC_VALUE + 1
     INTO   l_v_inv_no,         -- Fetching Invoice Value again - changed on 09/07/2004
            l_n_new_inv_no      -- Fetching Invoice Value again - changed on 09/07/2004
     FROM   INV_INV_CTRL
     WHERE  IC_YEAR = TO_NUMBER(TO_CHAR(l_d_sysdate,'YYYY')) 
     AND    IC_TY = 'I' 
     FOR UPDATE ;
     /***************TBR VI ODC. Issue No: 151.remove nowait as it is conflicting with sp_sin60000 batch.
                      Rohit commented code starts***************/
--   NOWAIT;
     /***************TBR VI ODC. Issue No: 151.remove nowait as it is conflicting with sp_sin60000 batch.
                      Rohit commented code ends***************/

     UPDATE INV_INV_CTRL
     SET IC_VALUE = l_n_new_inv_no
     WHERE IC_YEAR = TO_NUMBER(TO_CHAR(l_d_sysdate,'YYYY')) 
     AND   IC_TY = 'I';
   EXCEPTION
      WHEN l_excep_lock THEN
         LP_TBR013_PRCDR_ERR_HNDLR ('TBR', '01075', l_v_ret_typ);
      WHEN OTHERS THEN
         LP_TBR014_OTH_EXCPTNS;
   END;   
   END IF;
  

BEGIN
   INSERT INTO INV_DOC_HDR
   (
    IH_DOC_DT, 
    IH_DOC_NO, 
    IH_DOC_TY, 
    IH_SLSM_CD, 
    IH_CUST_CD, 
    IH_EMP_CD, 
    IH_CUST_NM_ENG, 
    IH_CUST_NM_TH, 
    IH_ADR_ADR, 
    IH_ADR_ROAD, 
    IH_ADR_DISTT, 
    IH_ADR_PRV, 
    IH_ADR_ZIP, 
    IH_CRE_BY, 
    IH_CRE_DT, 
    IH_UPD_BY, 
    IH_UPD_DT, 
    IH_PMT_CD, 
    IH_PMT_PERIOD, 
    IH_PMT_PERIOD_FLG, 
    IH_PMT_INT, 
    IH_PMT_INT_VEH_AMT, 
    IH_PMT_INT_OPT_AMT, 
    IH_TERM_YRS, 
    IH_PROJECT_NO, 
    IH_BUDGET_NO, 
    IH_PREQN_NO, 
    IH_COST_CENTER, 
    IH_WS_VEH_UPRC, 
    IH_WS_AIR_UPRC, 
    IH_WS_OPT_UPRC, 
    IH_TRD_DISC, 
    IH_VEH_DOWN_PMT, 
    IH_AIR_DOWN_PMT, 
    IH_OPT_DOWN_PMT, 
    IH_INV_VEH_UPRC, 
    IH_INV_AIR_UPRC, 
    IH_INV_OPT_UPRC, 
    IH_VAT, 
    IH_VAT_VEH_AMT, 
    IH_VAT_AIR_AMT, 
    IH_VAT_OPT_AMT, 
    IH_1_DUE_DT, 
    IH_1_DUE_AMT, 
    IH_LAST_DUE_DT, 
    IH_LAST_DUE_AMT, 
    IH_DUE_DT, 
    IH_UNITS, 
    IH_PRINT_FLG, 
    IH_PRINT_DT, 
    IH_CANCEL_FLG, 
    IH_CANCEL_DT, 
    IH_SAP_FLG, 
    IH_INV_VEH_AMT, 
    IH_INV_AIR_AMT, 
    IH_INV_OPT_AMT, 
    IH_SRS_CD, 
    IH_MOD_CD, 
    IH_MOD_SFX, 
    IH_CLR_TY, 
    IH_SLS_CH, 
    IH_SLS_TYP, 
    IH_WO_VAT, 
    IH_REF_INV_NO, 
    IH_RSN_CD, 
    IH_RSN_IND, 
    IH_CR_VEH_BAL, 
    IH_CR_OPT_BAL, 
    IH_REMARKS, 
    IH_VAT_CD, 
    IH_INV_NEW_VEH_AMT, 
    IH_INV_NEW_AIR_AMT, 
    IH_INV_NEW_OPT_AMT, 
    IH_DENSO_DOC_FLG, 
    IH_DENSO_DOC_DT, 
    IH_ICS_DOC_FLG, 
    IH_ICS_DOC_DT, 
    IH_ICS_CNL_FLG, 
    IH_ICS_CNL_DT, 
    IH_DLR_CD, 
    IH_CNL_RSN, 
    IH_ACT_CUST_NM, 
    IH_ACT_CUST_ADR, 
    IH_ACT_CUST_ROAD, 
    IH_ACT_CUST_DISTT, 
    IH_ACT_CUST_PRV, 
    IH_ACT_CUST_ZIP, 
    IH_TRD_OPT_DISC, 
    IH_AC_CD, 
    IH_SUB_GRP,
    IH_TAX_ID, -- Added by Bindu on 20/11/2013 for VAR Regulation Changes
    IH_BUS_PLC, -- Added by Bindu on 20/11/2013 for VAR Regulation Changes
    --Start added by Nattanan 8/2/2016 CR - CNDN Phase1
    IH_UPD_ADD_FLG
    --End added by Nattanan 8/2/2016 CR - CNDN Phase1
   )
   VALUES
   (
    :B02_INV_DOC_HDR.IH_DOC_DT,
    l_v_inv_no,
    'I',
    :B02_INV_DOC_HDR.IH_SLSM_CD,
    :B02_INV_DOC_HDR.NBT_IH_CUST_CD,
    :B02_INV_DOC_HDR.NBT_IH_EMP_CD,
    :B02_INV_DOC_HDR.NBT_IH_CUST_NM_ENG,
    :B02_INV_DOC_HDR.NBT_IH_CUST_NM_TH,
    :B02_INV_DOC_HDR.NBT_IH_ADR_ADR,
    :B02_INV_DOC_HDR.NBT_IH_ADR_ROAD,
    :B02_INV_DOC_HDR.NBT_IH_ADR_DISTT,
    :B02_INV_DOC_HDR.NBT_IH_ADR_PRV,
    :B02_INV_DOC_HDR.NBT_IH_ADR_ZIP,
    NVL(:GLOBAL.SM_ID, :B01_GLOBAL.NBT_US),
    l_d_sysdate,
    NULL,  -- Updated By 
    NULL,  -- Updated Date
    :B02_INV_DOC_HDR.NBT_IH_PMT_CD,
    :B02_INV_DOC_HDR.NBT_IH_PMT_PERIOD,
    :B02_INV_DOC_HDR.NBT_IH_PMT_PERIOD_FLG,
    :B02_INV_DOC_HDR.IH_PMT_INT,
    :B02_INV_DOC_HDR.IH_PMT_INT_VEH_AMT,
    :B02_INV_DOC_HDR.IH_PMT_INT_OPT_AMT,
    :B02_INV_DOC_HDR.NBT_IH_TERM_YRS,
    :B02_INV_DOC_HDR.NBT_IH_PROJECT_NO,
    :B02_INV_DOC_HDR.NBT_IH_BUDGET_NO,
    :B02_INV_DOC_HDR.NBT_IH_PREQN_NO,
    :B02_INV_DOC_HDR.NBT_IH_COST_CENTER,
    :B02_INV_DOC_HDR.IH_WS_VEH_UPRC,
    :B02_INV_DOC_HDR.IH_WS_AIR_UPRC,
    :B02_INV_DOC_HDR.IH_WS_OPT_UPRC,
    :B02_INV_DOC_HDR.IH_TRD_DISC,
    :B02_INV_DOC_HDR.IH_VEH_DOWN_PMT,
    :B02_INV_DOC_HDR.IH_AIR_DOWN_PMT,
    :B02_INV_DOC_HDR.IH_OPT_DOWN_PMT,
    :B02_INV_DOC_HDR.IH_INV_VEH_UPRC,
    :B02_INV_DOC_HDR.IH_INV_AIR_UPRC,
    :B02_INV_DOC_HDR.IH_INV_OPT_UPRC,
    :B02_INV_DOC_HDR.IH_VAT,
    :B02_INV_DOC_HDR.IH_VAT_VEH_AMT,
    :B02_INV_DOC_HDR.IH_VAT_AIR_AMT,
    :B02_INV_DOC_HDR.IH_VAT_OPT_AMT,
    :B02_INV_DOC_HDR.IH_1_DUE_DT,
    :B02_INV_DOC_HDR.IH_1_DUE_AMT,
    :B02_INV_DOC_HDR.IH_LAST_DUE_DT,
    :B02_INV_DOC_HDR.IH_LAST_DUE_AMT,
   /***************TBR VI Rel-4 Onsite IT-1: 22 . Rohit Commented and Added Code Starts***************/
--    :B02_INV_DOC_HDR.IH_DUE_DT,
    :B02_INV_DOC_HDR.NBT_IH_DUE_DT,
   /***************TBR VI Rel-4 Onsite IT-1: 22 . Rohit Commented and Added Code Starts***************/
    :B02_INV_DOC_HDR.IH_UNITS,
   /***************TBR VI Rel-4 Onsite IT-1: 23. Rohit Commented and Added Code Ends***************/
--    :B02_INV_DOC_HDR.IH_PRINT_FLG,
--    :B02_INV_DOC_HDR.IH_PRINT_DT,
    NULL, --Print Flag
    NULL, --Pring Date
   /***************TBR VI Rel-4 Onsite IT-1: 23. Rohit Commented and Added Code Ends***************/
    NULL,  -- Cancel flag
    NULL,  -- Cancel Date
    :B02_INV_DOC_HDR.IH_SAP_FLG,
    :B02_INV_DOC_HDR.IH_INV_VEH_AMT,
    :B02_INV_DOC_HDR.IH_INV_AIR_AMT,
    :B02_INV_DOC_HDR.IH_INV_OPT_AMT,
    :B02_INV_DOC_HDR.IH_SRS_CD,
    :B02_INV_DOC_HDR.IH_MOD_CD,
    :B02_INV_DOC_HDR.IH_MOD_SFX,
    NULL,  -- :B02_INV_DOC_HDR.IH_CLR_TY,
    :B02_INV_DOC_HDR.NBT_IH_SLS_CH,
    :B02_INV_DOC_HDR.IH_SLS_TYP,
    :B02_INV_DOC_HDR.NBT_IH_WO_VAT,
    :B02_INV_DOC_HDR.NBT_OLD_INV_NO, -- Ref inv no
    NULL, -- :B02_INV_DOC_HDR.IH_RSN_CD,  Reason Cd
    NULL, -- :B02_INV_DOC_HDR.IH_RSN_IND,
    :B02_INV_DOC_HDR.IH_CR_VEH_BAL,
    :B02_INV_DOC_HDR.IH_CR_OPT_BAL,
    /*Commented by Nattanan 06/05/2015
    :B02_INV_DOC_HDR.NBT_IH_REMARKS,*/
    REPLACE(:B02_INV_DOC_HDR.NBT_IH_REMARKS, CHR(10), ' '), /*Added by Nattanan 06/05/2015*/
    :B02_INV_DOC_HDR.IH_VAT_CD,
    :B02_INV_DOC_HDR.IH_INV_NEW_VEH_AMT,
    :B02_INV_DOC_HDR.IH_INV_NEW_AIR_AMT,
    :B02_INV_DOC_HDR.IH_INV_NEW_OPT_AMT,
    NULL, -- Denso interface flag
    NULL, -- Denso interface date
    NULL, -- ICS interface flag
    NULL, -- ICS interface date
    NULL, -- ICS cancel interface flag
    NULL, -- ICS cancel interface date
    :B02_INV_DOC_HDR.IH_DLR_CD,
    :B02_INV_DOC_HDR.IH_CNL_RSN,
    :B02_INV_DOC_HDR.IH_ACT_CUST_NM,
    :B02_INV_DOC_HDR.IH_ACT_CUST_ADR,
    :B02_INV_DOC_HDR.IH_ACT_CUST_ROAD,
    :B02_INV_DOC_HDR.IH_ACT_CUST_DISTT,
    :B02_INV_DOC_HDR.IH_ACT_CUST_PRV,
    :B02_INV_DOC_HDR.IH_ACT_CUST_ZIP,
    :B02_INV_DOC_HDR.IH_TRD_OPT_DISC,
    :B02_INV_DOC_HDR.IH_AC_CD,
    :B02_INV_DOC_HDR.NBT_IH_SUB_GRP,
    :B02_INV_DOC_HDR.NBT_IH_TAX_ID, -- Added by Bindu on 20/11/2013 for VAR Regulation Changes
    :B02_INV_DOC_HDR.NBT_IH_BUS_PLC, -- Added by Bindu on 20/11/2013 for VAR Regulation Changes
    --Start added by Nattanan 8/2/2016 CR - CNDN Phase1
    :B02_INV_DOC_HDR.NBT_UPD_CST_FLG
    --End added by Nattanan 8/2/2016 CR - CNDN Phase1
    );
EXCEPTION
   WHEN OTHERS THEN 
      FORMS_DDL('ROLLBACK');
      LP_TBR014_OTH_EXCPTNS;      
END;
----------------------------------------------------------------------------------------
      BEGIN
         INSERT INTO INV_DOC_COA
         (
         ID_DOC_NO, 
         ID_DOC_TYP, 
         ID_CRE_BY, 
         ID_CRE_DT, 
         ID_UPD_BY, 
         ID_UPD_DT, 
         ID_DOC_COA
         )
         VALUES
         (l_v_inv_no,
         'I',
         NVL(:GLOBAL.SM_ID, :B01_GLOBAL.NBT_US),
         l_d_sysdate,
         NULL,    
         NULL,   
         :B02_INV_DOC_HDR.NBT_INV_DOC_COA 
      );
      EXCEPTION
         WHEN OTHERS THEN 
            FORMS_DDL('ROLLBACK');
            LP_TBR014_OTH_EXCPTNS;      
      END;

----------------------------------------------------------------------------------------

-- call procedure to insert record in VSC_INV_INFO
   FP_INV_INS_VSC_INV_INFO(l_v_inv_no, l_n_new_inv_no);
   :B02_INV_DOC_HDR.NBT_NEW_INV_NO := l_v_inv_no;
	 
	 --Start added by Nattanan 25/02/2015 coding by Dey
		/*Commented by Nattanan 16/05/2015
		UPDATE INV_CROSS_CAMPAIGN_DTL 
		SET 	 ICC_DOC_NO = :B02_INV_DOC_HDR.NBT_NEW_INV_NO,
					 ICC_ALLOC_DT = l_d_sysdate,
					 ICC_CRE_DT = l_d_sysdate,
					 ICC_INV_FLG = 'N'
		WHERE ICC_DOC_NO = :B02_INV_DOC_HDR.NBT_OLD_INV_NO;*/
	 --End added by Nattanan 25/02/2015 coding by Dey
	 
	 --Start added by Nattanan 15/05/2015
	 SP_SINV00001.sp_main(:B02_INV_DOC_HDR.NBT_NEW_INV_NO,'I',L_N_ERR_CD,l_v_err_msg);
	
			      IF l_v_err_msg IS NOT NULL THEN
							  INSERT
							  INTO
							    TBR_ERR_LOG
							    (
							      EL_MOD_NM,
							      EL_ERR_CD,
							      EL_PROG_ID,
							      EL_ERR_MSG,
							      EL_CRE_BY,
							      EL_CRE_DT
							    )
							    VALUES
							    (
							      'INV',
							      L_N_ERR_CD,
							      'FINV60060',
							      l_v_err_msg,
							      :B01_GLOBAL.NBT_US,
							      :B01_GLOBAL.NBT_DT
							    );
			      END IF;
	 --End added by Nattanan 15/05/2015
	 
EXCEPTION
   WHEN OTHERS THEN 
      LP_TBR014_OTH_EXCPTNS;
END;
EXCEPTION
   WHEN FORM_TRIGGER_FAILURE THEN
      RAISE FORM_TRIGGER_FAILURE;
   WHEN OTHERS THEN 
      LP_TBR014_OTH_EXCPTNS;
END;
-----
PACKAGE FP_INV_VAR IS
  l_cancel_flg     INV_DOC_HDR.IH_CANCEL_FLG%TYPE := NULL;
  l_doc_no         INV_DOC_HDR.IH_DOC_NO%TYPE := NULL;
  l_old_doc_no     INV_DOC_HDR.IH_DOC_NO%TYPE := NULL;
  l_new_doc_no     INV_DOC_HDR.IH_DOC_NO%TYPE := NULL;
/*
  this flag is 'S'ucess by default and 'F'ail when error occurs while cancelling/re-issuing the invoice
*/
  l_ent_qry_flg    VARCHAR2(1) := 'S';  
END;
----
--Start added by Nattanan 8/2/2016 CR - CNDN Phase1
PROCEDURE FP_POP_PAYMENT_TERM IS
   l_rg_pay_type    RECORDGROUP;
   l_n_status       NUMBER;
   l_v_qry          VARCHAR2(2000);
   l_v_ret_type     TBR_ERR_MST.EM_ERR_TYP%TYPE;
   l_v_mod_nm       TBR_ERR_MST.EM_MOD_NM%TYPE;
   l_v_err_cd       TBR_ERR_MST.EM_ERR_CD%TYPE;
BEGIN
	/*Check A.) Clear payment type list and create Recordgroup using DS_CODE_MST Table*/
   CLEAR_LIST('B02_INV_DOC_HDR.NBT_IH_PMT_CD');

   l_rg_pay_type := FIND_GROUP('pay_type_rg'); 
   IF NOT Id_Null(l_rg_pay_type) THEN 
      DELETE_GROUP(l_rg_pay_type); 
   END IF; 

   l_v_qry := 'SELECT  CDM_CD'||'||'||''''||' '||''''||'||'||'CDM_DESC CDM_CD, CDM_CD  FROM DS_CODE_MST WHERE CDM_CD_TYP = '||''''||'INV'||''''||'  AND (CDM_PMT_CUST_STAFF = '||''''||'Y'||''''||'  OR CDM_PMT_CUST_DS = '||''''||'Y'||''''||' )';
   /***************TBR VI Rel-4 Offshore. Issue No: 9. Rohit Added Code Starts***************/
   l_v_qry := l_v_qry||' ORDER BY 2';
   /***************TBR VI Rel-4 Offshore. Issue No: 9. Rohit Added Code Ends***************/

   l_rg_pay_type := CREATE_GROUP_FROM_QUERY ('pay_type_rg',l_v_qry);
   l_n_status := POPULATE_GROUP('pay_type_rg');
   -- Check if population has been successful
   IF l_n_status <> 0 THEN
       LP_TBR013_PRCDR_ERR_HNDLR('INV','20220',l_v_ret_type);
   END IF;

   /* Check B.) Populate Payment Type List using record Group created in step A.*/
   IF l_n_status = 0 THEN
      POPULATE_LIST('B02_INV_DOC_HDR.NBT_IH_PMT_CD',l_rg_pay_type);
   END IF;  
EXCEPTION
   WHEN FORM_TRIGGER_FAILURE THEN 
      RAISE FORM_TRIGGER_FAILURE;
   WHEN OTHERS THEN
      LP_TBR014_OTH_EXCPTNS;  
END;
--End added by Nattanan 8/2/2016 CR - CNDN Phase1
-----------
--Start added by Nattanan 8/2/2016 CR - CNDN Phase1
PROCEDURE FP_ROLLBACK_INV_DATA IS
l_al_id            ALERT; 
l_n_al_button      NUMBER;
l_v_ret_type      TBR_ERR_MST.EM_ERR_TYP%TYPE;
BEGIN
--Rollback values from invoice table
:B02_INV_DOC_HDR.NBT_IH_DLR_CD := :B02_INV_DOC_HDR.IH_DLR_CD;	  	  
:B02_INV_DOC_HDR.NBT_IH_CUST_CD := :B02_INV_DOC_HDR.IH_CUST_CD;
:B02_INV_DOC_HDR.NBT_IH_SLS_TYP := :B02_INV_DOC_HDR.IH_SLS_TYP;
:B02_INV_DOC_HDR.NBT_IH_SUB_GRP := :B02_INV_DOC_HDR.IH_SUB_GRP;
:B02_INV_DOC_HDR.NBT_IH_SLS_CH := :B02_INV_DOC_HDR.IH_SLS_CH;
:B02_INV_DOC_HDR.NBT_IH_WO_VAT := :B02_INV_DOC_HDR.IH_WO_VAT; 		
:B02_INV_DOC_HDR.NBT_IH_EMP_CD := :B02_INV_DOC_HDR.IH_EMP_CD;
:B02_INV_DOC_HDR.NBT_IH_TAX_ID := :B02_INV_DOC_HDR.IH_TAX_ID; 
:B02_INV_DOC_HDR.NBT_IH_BUS_PLC := :B02_INV_DOC_HDR.IH_BUS_PLC;
:B02_INV_DOC_HDR.NBT_IH_CUST_NM_ENG := :B02_INV_DOC_HDR.IH_CUST_NM_ENG;
:B02_INV_DOC_HDR.NBT_IH_CUST_NM_TH := :B02_INV_DOC_HDR.IH_CUST_NM_TH;
:B02_INV_DOC_HDR.NBT_IH_ADR_ADR := :B02_INV_DOC_HDR.IH_ADR_ADR;
:B02_INV_DOC_HDR.NBT_IH_ADR_ROAD := :B02_INV_DOC_HDR.IH_ADR_ROAD;
:B02_INV_DOC_HDR.NBT_IH_ADR_DISTT := :B02_INV_DOC_HDR.IH_ADR_DISTT;
:B02_INV_DOC_HDR.NBT_IH_ADR_PRV := :B02_INV_DOC_HDR.IH_ADR_PRV;
:B02_INV_DOC_HDR.NBT_IH_ADR_ZIP := :B02_INV_DOC_HDR.IH_ADR_ZIP;		
:B02_INV_DOC_HDR.NBT_IH_PMT_CD := :B02_INV_DOC_HDR.IH_PMT_CD;
:B02_INV_DOC_HDR.NBT_IH_PROJECT_NO := :B02_INV_DOC_HDR.IH_PROJECT_NO;
:B02_INV_DOC_HDR.NBT_IH_PREQN_NO := :B02_INV_DOC_HDR.IH_PREQN_NO;
:B02_INV_DOC_HDR.NBT_IH_PMT_PERIOD_FLG := :B02_INV_DOC_HDR.IH_PMT_PERIOD_FLG; 		
:B02_INV_DOC_HDR.NBT_IH_PMT_PERIOD := :B02_INV_DOC_HDR.IH_PMT_PERIOD;
:B02_INV_DOC_HDR.NBT_IH_BUDGET_NO := :B02_INV_DOC_HDR.IH_BUDGET_NO;
:B02_INV_DOC_HDR.NBT_IH_COST_CENTER := :B02_INV_DOC_HDR.IH_COST_CENTER;
:B02_INV_DOC_HDR.NBT_IH_TERM_YRS := :B02_INV_DOC_HDR.IH_TERM_YRS;
:B02_INV_DOC_HDR.NBT_INV_DOC_COA := :B02_INV_DOC_HDR.INV_DOC_COA;
--For display in the screen
BEGIN
SELECT DECODE(CM_SLS_TYP,'D','Domestic','E','Indirect Export'),
       GM_GRP_TYP||' '||GM_GRP_DESC, 
       CM_SAP_CD
INTO   :B02_INV_DOC_HDR.NBT_SLS_TYP_DESC,
       :B02_INV_DOC_HDR.NBT_IH_SLS_CH_DESC, 
       :B02_INV_DOC_HDR.NBT_CM_SAP_CD
FROM   INV_CUST_MST, INV_GRP_MST
WHERE  CM_CD = :B02_INV_DOC_HDR.NBT_IH_CUST_CD
AND    CM_SUB_GRP = INV_GRP_MST.GM_GRP_CD  
AND    INV_CUST_MST.CM_SLS_CH = INV_GRP_MST.GM_GRP_TYP;
EXCEPTION WHEN NO_DATA_FOUND THEN
    LP_TBR013_PRCDR_ERR_HNDLR ('INV', '20240', l_v_ret_type);
WHEN OTHERS THEN
    LP_TBR014_OTH_EXCPTNS;
END;

END;
--End added by Nattanan 8/2/2016 CR - CNDN Phase1
---------------
/*
   Name           :  FP_SET_ITEM_BG_COLOR
   Module         :  INV
   Purpose        :  Change Background color of Text item as per sales channel

   History        :
   Author          Date               What
   ---------       ----               ----
   Amrinder      03/09/2019         ATLAS Kaizen changes
*/
PROCEDURE FP_SET_ITEM_BG_COLOR(p_i_v_mode IN VARCHAR2) IS /*Q-Execute Query, E-Enter Query*/
   l_v_excp_cust_cnt   NUMBER :=0; --Added by Amrinder on 03/09/2019 for ATLAS Kaizen changes
BEGIN
   SELECT COUNT(1)
   INTO l_v_excp_cust_cnt
   FROM DDMS_CODE_MST
   WHERE DCM_CD_TYP = 'ATLAS'
   AND DCM_CD = :B02_INV_DOC_HDR.IH_CUST_CD;

   IF NVL(:B02_INV_DOC_HDR.NBT_UPD_CST_FLG,'N') = 'Y' THEN
      IF p_i_v_mode = 'Q' THEN
         IF :B02_INV_DOC_HDR.IH_SLS_CH IN ('3','4') AND l_v_excp_cust_cnt = 0 THEN
            SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_INV_DOC_COA', CURRENT_RECORD,VISUAL_ATTRIBUTE,'CG$MANDATORY_ITEM');
            SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_IH_COST_CENTER', CURRENT_RECORD,VISUAL_ATTRIBUTE,'CG$MANDATORY_ITEM');
         ELSE
            SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_INV_DOC_COA', CURRENT_RECORD,VISUAL_ATTRIBUTE,'WHITE_10');
            SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_IH_COST_CENTER', CURRENT_RECORD,VISUAL_ATTRIBUTE,'WHITE_10');
         END IF;

         IF :B02_INV_DOC_HDR.IH_SLS_CH = '5' THEN
            SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_IH_PROJECT_NO', CURRENT_RECORD,VISUAL_ATTRIBUTE,'CG$MANDATORY_ITEM');
         ELSE
            SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_IH_PROJECT_NO', CURRENT_RECORD,VISUAL_ATTRIBUTE,'WHITE_10');
         END IF;

         IF :B02_INV_DOC_HDR.IH_SLS_CH NOT IN ('3','4','5') THEN
            SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_IH_PREQN_NO', CURRENT_RECORD,VISUAL_ATTRIBUTE,'CG$MANDATORY_ITEM');
         ELSE
            SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_IH_PREQN_NO', CURRENT_RECORD,VISUAL_ATTRIBUTE,'WHITE_10');
         END IF;
      ELSIF p_i_v_mode = 'E' THEN
         SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_INV_DOC_COA', CURRENT_RECORD,VISUAL_ATTRIBUTE,'GRAY_10');
         SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_IH_COST_CENTER', CURRENT_RECORD,VISUAL_ATTRIBUTE,'GRAY_10');
         SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_IH_PROJECT_NO', CURRENT_RECORD,VISUAL_ATTRIBUTE,'WHITE_10');
         SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_IH_PREQN_NO', CURRENT_RECORD,VISUAL_ATTRIBUTE,'WHITE_10');
      END IF;
   ELSIF NVL(:B02_INV_DOC_HDR.NBT_UPD_CST_FLG,'N') = 'N' THEN
      SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_INV_DOC_COA', CURRENT_RECORD,VISUAL_ATTRIBUTE,'GRAY_10');
      SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_IH_COST_CENTER', CURRENT_RECORD,VISUAL_ATTRIBUTE,'GRAY_10');
      SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_IH_PROJECT_NO', CURRENT_RECORD,VISUAL_ATTRIBUTE,'GRAY_10');
      SET_ITEM_INSTANCE_PROPERTY( 'B02_INV_DOC_HDR.NBT_IH_PREQN_NO', CURRENT_RECORD,VISUAL_ATTRIBUTE,'GRAY_10');
   END IF;
END;
----------------------
/*
   Name           :  FP_TBR_WHN_NEW_FRM_INSTNC
   
   Module         :  TBR

   Purpose        :  Do On Load Procesing
                     
   Calls          :  FP_INV_POPULATE_LISTS
                   
   Returns        :  Null

   Steps Involved :  Check A.) Set Form Title.
                     Check B.) Fetch and display Date and User on Top right corner of screen.    
                     Check C.) Populate Reason Type using FP_INV_POPULATE_LISTS
 

   History        :
   Author          Date               What
   ------          ----               ----
   Gagan           24/11/2003         1.0
   Rohit           14/09/2004         TBR VI ODC. Issue no: 255.
   Rohit           16/11/2004         TBR VI SNM. Issue no: 40
   Rahul           04/09/2009         To send Cm Code instead of SAP code to call SP_SINV60015
   Nama            14/07/2010         Show COA for the Invoice
   Amrinder        01/11/2011         TBR Migration
   Vishal					 24/05/2017					Changes for TNGA CR
   																		1. Trim AND NVL added to Engine PRefix fields for removing leading and trailing space
   																		2. Changed size of Engine prefix fields from 3 to 5
   Mayank          25/07/2019         ATLAS Kaizen changes - a) Change label from COA to WBS
                                                             b) Increase Cost Center field from 8 to 10
                                                                1) IH_COST_CENTER     - property length change from 8 to 10
                                                                2) NBT_IH_COST_CENTER - property length change from 8 to 10
                                                                3) B02_INV_DOC_HDR -> Change IH_COST_CENTER length from 8 to 10 at Data block property
                                     
*/

PROCEDURE FP_TBR_WHN_NEW_FRM_INSTNC IS

   l_v_ret_typ      VARCHAR2(1);

   /****************TBR VI ODC. Issue no: 255. Rohit changed code starts*****************/
-- l_v_version      TBR_PROG_DTLS.TPD_VERSION1%TYPE := '5.3';
-- l_v_version      TBR_PROG_DTLS.TPD_VERSION1%TYPE := '5.4';
-- l_v_version      TBR_PROG_DTLS.TPD_VERSION1%TYPE := '5.5'; --Incremented for SNM Issue no 40. Rohit changed code dt: 16/11/2004
   /****************TBR VI ODC. Issue no: 255. Rohit changed code ends*****************/
-- l_v_version      TBR_PROG_DTLS.TPD_VERSION1%TYPE := '5.6'; -- Added by Rahul on 04-Sep-2009
-- l_v_version      TBR_PROG_DTLS.TPD_VERSION1%TYPE := '5.7'; -- Added by Nama  on 14-Jul-2010
   l_v_version      TBR_PROG_DTLS.TPD_VERSION1%TYPE := '1.0'; -- Added by Amrinder on 01-Nov-2011

   l_v_mod_nm       TBR_ERR_MST.EM_MOD_NM%TYPE;
   l_v_err_cd       TBR_ERR_MST.EM_ERR_CD%TYPE;
   l_v_prog_id      TBR_PROG_DTLS.TPD_PROG_ID%TYPE := GET_APPLICATION_PROPERTY(CURRENT_FORM_NAME);

BEGIN

  :GLOBAL.SM_ID := :GLOBAL.SM_ID;
   IF :GLOBAL.G_C_ERR = 'T' THEN
      EXIT_FORM;
   END IF;

   /*Check A.) Set Form Title*/
   LP_TBR016_WINPROC_INV('INV',:GLOBAL.WIN_TYP,'Invoice Cancellation / Re-Issuing (FINV60060 Ver ' || l_v_version || ')'); 

   /*Check B.) Fetch and display Date and User on Top right corner of screen*/
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

   --START - /****Commented by Amrinder on 01/11/2011 for TBR Migration****/
   /*
   DECLARE
      l_v_mod_nm       TBR_ERR_MST.EM_MOD_NM%TYPE;
      l_v_err_cd       TBR_ERR_MST.EM_ERR_CD%TYPE;
      l_v_prog_id      TBR_PROG_DTLS.TPD_PROG_ID%TYPE := GET_APPLICATION_PROPERTY(CURRENT_FORM_NAME);
      l_v_ret_typ      TBR_ERR_MST.EM_ERR_TYP%TYPE;
   BEGIN
      LP_DNS013_CHECK_VERSION (l_v_prog_id,
                               l_v_version,
                               l_v_mod_nm,
                               l_v_err_cd  
                              );
                              
      IF l_v_err_cd <> '00000' THEN
         LP_TBR013_PRCDR_ERR_HNDLR (l_v_mod_nm, l_v_err_cd, l_v_ret_typ);
         EXIT_FORM(NO_VALIDATE);
      END IF;
   END;
   */
   
   --Start added by Nattanan 8/2/2016 CR - CNDN Phase1
   IF GET_ITEM_PROPERTY('B02_INV_DOC_HDR.NBT_REISSUE_INVOICE', ENABLED) = 'TRUE' THEN   
   SET_ITEM_PROPERTY('B02_INV_DOC_HDR.NBT_REISSUE_INVOICE', ENABLED, PROPERTY_FALSE);
   END IF;
   --Start added by Nattanan 8/2/2016 CR - CNDN Phase1
   
   --END - /****Commented by Amrinder on 01/11/2011 for TBR Migration****/
   SET_BLOCK_PROPERTY('B02_INV_DOC_HDR',INSERT_ALLOWED,PROPERTY_FALSE);
   SET_BLOCK_PROPERTY('B02_INV_DOC_HDR',UPDATE_ALLOWED,PROPERTY_FALSE);
   FP_INV_ENABLE_DISABLE;
   FP_INV_VAR.l_ent_qry_flg := 'S';
   DO_KEY('ENTER_QUERY');
END;
---------------
PROCEDURE Query_Master_Details(rel_id Relation,detail VARCHAR2) IS
  oldmsg VARCHAR2(2);  -- Old Message Level Setting
  reldef VARCHAR2(5);  -- Relation Deferred Setting
BEGIN
  --
  -- Initialize Local Variable(s)
  --
  reldef := Get_Relation_Property(rel_id, DEFERRED_COORDINATION);
  oldmsg := :System.Message_Level;
  --
  -- If NOT Deferred, Goto detail and execute the query.
  --
  IF reldef = 'FALSE' THEN
    Go_Block(detail);
    Check_Package_Failure;
    :System.Message_Level := '10';
    Execute_Query;
    :System.Message_Level := oldmsg;
  ELSE
    --
    -- Relation is deferred, mark the detail block as un-coordinated
    --
    Set_Block_Property(detail, COORDINATION_STATUS, NON_COORDINATED);
  END IF;

EXCEPTION
    WHEN Form_Trigger_Failure THEN
      :System.Message_Level := oldmsg;
      RAISE;
END Query_Master_Details;
