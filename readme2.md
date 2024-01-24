/*
   Name           :  FF_DLR_CHECK_NATIONAL_ID
   Module         :  DLR
   Purpose        :  Return 'Y' if entered customer Id is satisfied for National id or 'N' if customer id
                     does not satisfies Customer Id.
   Calls          :  
   Returns        :  'Y' or 'N'
   Steps Involved : 
   History        :
   Author          Date               What
   ------          ----               ----
   Bindu         06/12/2013        For VAT Regulation Changes.  
*/

FUNCTION FF_DLR_CHECK_NATIONAL_ID RETURN VARCHAR2
IS
   l_n_cst_id     NUMBER;
   l_v_cst_id     VARCHAR2(13);
   l_n_digit      NUMBER;
   l_n_multiplier NUMBER := 13;
   l_n_sum        NUMBER := 0;
   l_n_temp       NUMBER ;
   l_v_ret_typ    VARCHAR2(1);
BEGIN
   BEGIN
      l_n_cst_id := NVL(:B03_CUST_MST.CM_CUST_TAX_ID, 0);
   EXCEPTION
   WHEN VALUE_ERROR THEN
      RETURN 'N';
   END;
   l_v_cst_id := :B03_CUST_MST.CM_CUST_TAX_ID;
   IF LENGTH(l_v_cst_id) < 13 THEN
      RETURN 'N';
   ELSE
      FOR l_n_local IN  1..12 LOOP
         l_n_digit := SUBSTR(l_v_cst_id,l_n_local,1);
         l_n_sum   := l_n_sum + (l_n_digit * l_n_multiplier);  
         l_n_multiplier := l_n_multiplier - 1;
      END LOOP;
      l_n_temp := 11 - MOD(l_n_sum,11);
      IF(l_n_temp>9) THEN
         l_n_temp:=l_n_temp-10;
      END IF;
      IF l_n_temp <> SUBSTR(l_v_cst_id,13) THEN
         RETURN 'N';
      END IF;
   END IF;
   RETURN 'Y';
END;
