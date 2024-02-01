/*******************************************
 *******************************************/

/*
   Name           :  WHEN-BUTTON-PRESSED
   
   Module         :  INV

   Purpose        :  Null

   Calls          :  LP_TBR014_OTH_EXCPTNS

   Returns        :  

   Steps involved :  CHECK A :- Creation of parameter list if the parameter list does not already exist,
                                if the parameter list already exists then destroy the parameter list and 
                                create again
                     CHECK B :- Pass the parameters and call report RINV60025
   History        :
   Author          Date               What
   ------          ----               ----
   Suvrangshu Dey  01-11-2014           1.0
*/

PROCEDURE CANCEL_PRINT 
IS 

   l_pl_id           PARAMLIST; 
   l_pl_name         VARCHAR2(10) := 'PARAMLIST';
   l_print_flg       INV_DOC_HDR.IH_PRINT_FLG%TYPE := NULL;
   l_v_ret_type        TBR_ERR_MST.EM_ERR_TYP%TYPE;
   l_e_record_locked    EXCEPTION;
   PRAGMA EXCEPTION_INIT(l_e_record_locked,-00054);
   -- Added by shaily for ODC Issue 167,168 starts
   l_v_cancel_flg    INV_DOC_HDR.IH_CANCEL_FLG%TYPE; 
   -- Added by shaily for ODC Issue 167,168 ends
   --ADDED BY SUVRANGSHU DEY FOR EDF KAIZEN (START) ON 13-10-2014
   l_n_err_cd		NUMBER;
	 l_v_ip_address	VARCHAR2(15);
	 l_V_err_cd			NUMBER;
	 l_v_err_msg    VARCHAR2(200);
   --ADDED BY SUVRANGSHU DEY FOR EDF KAIZEN (START) ON 13-10-2014
   l_v_printer_call TBR_PRC_CTRL.tpc_val%type;
BEGIN

		   l_pl_id := GET_PARAMETER_LIST ('TMPDATA') ;
		   IF NOT ID_NULL (l_pl_id) THEN
		      DESTROY_PARAMETER_LIST (l_pl_id);
		   END IF;
		
		   l_pl_id := CREATE_PARAMETER_LIST ('TMPDATA') ;
		   IF NOT Id_Null(l_pl_id) THEN 
		      ADD_PARAMETER (l_pl_id, 'P_I_V_DOC_NO', TEXT_PARAMETER, :B02_INV_DOC_HDR.NBT_INV_NO);
		      ADD_PARAMETER(l_pl_id,'P_I_V_DOC_TYP',TEXT_PARAMETER, 'I'); 
		      ADD_PARAMETER(l_pl_id,'P_I_V_SAL_CH',TEXT_PARAMETER, NULL); 
		      ADD_PARAMETER(l_pl_id,'ORIENTATION',TEXT_PARAMETER, 'PORTRAIT'); 
		      ADD_PARAMETER (l_pl_id, 'PARAMFORM', TEXT_PARAMETER, 'NO');
		      ADD_PARAMETER (l_pl_id, 'P_I_V_FRM_DT', TEXT_PARAMETER , NULL );
		      ADD_PARAMETER (l_pl_id, 'P_I_V_TO_DT', TEXT_PARAMETER , NULL );
		      RP2RRO.RP2RRO_RUN_PRODUCT (REPORTS, 'RINV61045', SYNCHRONOUS, RUNTIME, FILESYSTEM, l_pl_id, NULL );
		   END IF;
					/* ADDED BY SUVRANGSHU FOR EDF KAIZEN ON 13-10-2014 (START) --ACTIVITY LOG */
					      BEGIN
									SELECT SYS_CONTEXT('USERENV', 'IP_ADDRESS', 15) 
									INTO	l_v_ip_address
									FROM DUAL; 
										SP_SINV61040(:B01_GLOBAL.NBT_US,
										                :B01_GLOBAL.NBT_DT,
										                :B02_INV_DOC_HDR.NBT_NEW_INV_NO,
										                'I',
										                'P',
										                l_v_ip_address,
										                l_v_err_cd,
										                l_v_err_msg
										                );
								END;
					/* ADDED BY SUVRANGSHU FOR EDF KAIZEN ON 13-10-2014 (END) --ACTIVITY LOG  */   
		   
END;
--------------
Procedure Check_Package_Failure IS
BEGIN
  IF NOT ( Form_Success ) THEN
    RAISE Form_Trigger_Failure;
  END IF;
END;
-------------
PROCEDURE Clear_All_Master_Details IS
  mastblk  VARCHAR2(30);  -- Initial Master Block Cusing Coord
  coordop  VARCHAR2(30);  -- Operation Causing the Coord
  trigblk  VARCHAR2(30);  -- Cur Block On-Clear-Details Fires On
  startitm VARCHAR2(61);  -- Item in which cursor started
  frmstat  VARCHAR2(15);  -- Form Status
  curblk   VARCHAR2(30);  -- Current Block
  currel   VARCHAR2(30);  -- Current Relation
  curdtl   VARCHAR2(30);  -- Current Detail Block

  FUNCTION First_Changed_Block_Below(Master VARCHAR2)
  RETURN VARCHAR2 IS
    curblk VARCHAR2(30);  -- Current Block
    currel VARCHAR2(30);  -- Current Relation
    retblk VARCHAR2(30);  -- Return Block
  BEGIN
    --
    -- Initialize Local Vars
    --
    curblk := Master;
    currel := Get_Block_Property(curblk,  FIRST_MASTER_RELATION);
    --
    -- While there exists another relation for this block
    --
    WHILE currel IS NOT NULL LOOP
      --
      -- Get the name of the detail block
      --
      curblk := Get_Relation_Property(currel, DETAIL_NAME);
      --
      -- If this block has changes, return its name
      --
      IF ( Get_Block_Property(curblk, STATUS) IN('CHANGED','INSERT') ) THEN
        RETURN curblk;
      ELSE
        --
        -- No changes, recursively look for changed blocks below
        --
        retblk := First_Changed_Block_Below(curblk);
        --
        -- If some block below is changed, return its name
        --
        IF retblk IS NOT NULL THEN
          RETURN retblk;
        ELSE
          --
          -- Consider the next relation
          --
          currel := Get_Relation_Property(currel, NEXT_MASTER_RELATION);
        END IF;
      END IF;
    END LOOP;

    --
    -- No changed blocks were found
    --
    RETURN NULL;
  END First_Changed_Block_Below;

BEGIN
  --
  -- Init Local Vars
  --
  mastblk  := :System.Master_Block;
  coordop  := :System.Coordination_Operation;
  trigblk  := :System.Trigger_Block;
  startitm := :System.Trigger_Item;
  frmstat  := :System.Form_Status;

  --
  -- If the coordination operation is anything but CLEAR_RECORD or
  -- SYNCHRONIZE_BLOCKS, then continue checking.
  --
  IF coordop NOT IN ('CLEAR_RECORD', 'SYNCHRONIZE_BLOCKS') THEN
    --
    -- If we're processing the driving master block...
    --
    IF mastblk = trigblk THEN
      --
      -- If something in the form is changed, find the
      -- first changed block below the master
      --
      IF frmstat = 'CHANGED' THEN
        curblk := First_Changed_Block_Below(mastblk);
        --
        -- If we find a changed block below, go there
        -- and Ask to commit the changes.
        --
        IF curblk IS NOT NULL THEN
          Go_Block(curblk);
          Check_Package_Failure;
          Clear_Block(ASK_COMMIT);
          --
          -- If user cancels commit dialog, raise error
          --
          IF NOT ( :System.Form_Status = 'QUERY'
                   OR :System.Block_Status = 'NEW' ) THEN
            RAISE Form_Trigger_Failure;
          END IF;
        END IF;
      END IF;
    END IF;
  END IF;

  --
  -- Clear all the detail blocks for this master without
  -- any further asking to commit.
  --
  currel := Get_Block_Property(trigblk, FIRST_MASTER_RELATION);
  WHILE currel IS NOT NULL LOOP
    curdtl := Get_Relation_Property(currel, DETAIL_NAME);
    IF Get_Block_Property(curdtl, STATUS) <> 'NEW'  THEN
      Go_Block(curdtl);
      Check_Package_Failure;
      Clear_Block(NO_VALIDATE);
      IF :System.Block_Status <> 'NEW' THEN
        RAISE Form_Trigger_Failure;
      END IF;
    END IF;
    currel := Get_Relation_Property(currel, NEXT_MASTER_RELATION);
  END LOOP;

  --
  -- Put cursor back where it started
  --
  IF :System.Cursor_Item <> startitm THEN
    Go_Item(startitm);
    Check_Package_Failure;
  END IF;

EXCEPTION
  WHEN Form_Trigger_Failure THEN
    IF :System.Cursor_Item <> startitm THEN
      Go_Item(startitm);
    END IF;
    RAISE;

END Clear_All_Master_Details;
---------------
PACKAGE DirectPrint /* com.niit.tbr.common.print.DirectPrint */ IS

  -- 
  -- DO NOT EDIT THIS FILE - it is machine generated!
  -- 
  BEAN_NAME	ORA_JAVA.JOBJECT;	-- BEAN_NAME
  DEBUG_MODE	ORA_JAVA.JOBJECT;	-- DEBUG_MODE
  DELIVER_EVENT	ORA_JAVA.JOBJECT;	-- DELIVER_EVENT
  FOCUS_EVENT	ORA_JAVA.JOBJECT;	-- FOCUS_EVENT
  KEY_EVENT	ORA_JAVA.JOBJECT;	-- KEY_EVENT
  DEFAULT_COLOR_0	ORA_JAVA.JOBJECT;	-- DEFAULT_COLOR
  MNEMONIC_INDEX_NONE	NUMBER;	-- MNEMONIC_INDEX_NONE
  MNEMONIC_CHAR_NONE	PLS_INTEGER;	-- MNEMONIC_CHAR_NONE
  DEFAULT_BORDERPAINTER	ORA_JAVA.JOBJECT;	-- DEFAULT_BORDERPAINTER
  DEFAULT_PAINTER	ORA_JAVA.JOBJECT;	-- DEFAULT_PAINTER
  DEFAULT_COLOR_1	ORA_JAVA.JOBJECT;	-- DEFAULT_COLOR
  DEFAULT_FONT	ORA_JAVA.JOBJECT;	-- DEFAULT_FONT
  TOP_ALIGNMENT	NUMBER;	-- TOP_ALIGNMENT
  CENTER_ALIGNMENT	NUMBER;	-- CENTER_ALIGNMENT
  BOTTOM_ALIGNMENT	NUMBER;	-- BOTTOM_ALIGNMENT
  LEFT_ALIGNMENT	NUMBER;	-- LEFT_ALIGNMENT
  RIGHT_ALIGNMENT	NUMBER;	-- RIGHT_ALIGNMENT
  WIDTH	NUMBER;	-- WIDTH
  HEIGHT	NUMBER;	-- HEIGHT
  PROPERTIES	NUMBER;	-- PROPERTIES
  SOMEBITS	NUMBER;	-- SOMEBITS
  FRAMEBITS	NUMBER;	-- FRAMEBITS
  ALLBITS	NUMBER;	-- ALLBITS
  ERROR	NUMBER;	-- ERROR
  ABORT	NUMBER;	-- ABORT


  -- Constructor for signature ()V
  FUNCTION new RETURN ORA_JAVA.JOBJECT;

  -- Method: setProperty (Loracle/forms/properties/ID;Ljava/lang/Object;)Z
  FUNCTION setProperty(
    obj   ORA_JAVA.JOBJECT,
    a0    ORA_JAVA.JOBJECT,
    a1    ORA_JAVA.JOBJECT) RETURN BOOLEAN;

  -- Method: init (Loracle/forms/handler/IHandler;)V
  PROCEDURE init(
    obj   ORA_JAVA.JOBJECT,
    a0    ORA_JAVA.JOBJECT);

END;
--------
PACKAGE BODY DirectPrint IS

  -- 
  -- DO NOT EDIT THIS FILE - it is machine generated!
  -- 

  args   JNI.ARGLIST;

  -- Constructor for signature ()V
  FUNCTION new RETURN ORA_JAVA.JOBJECT IS
  BEGIN
    args := NULL;
    RETURN (JNI.NEW_OBJECT('com/niit/tbr/common/print/DirectPrint', '()V', args));
  END;

  -- Method: setProperty (Loracle/forms/properties/ID;Ljava/lang/Object;)Z
  FUNCTION setProperty(
    obj   ORA_JAVA.JOBJECT,
    a0    ORA_JAVA.JOBJECT,
    a1    ORA_JAVA.JOBJECT) RETURN BOOLEAN IS
  BEGIN
    args := JNI.CREATE_ARG_LIST(2);
    JNI.ADD_OBJECT_ARG(args, a0, 'oracle/forms/properties/ID');
    JNI.ADD_OBJECT_ARG(args, a1, 'java/lang/Object');
    RETURN JNI.CALL_BOOLEAN_METHOD(FALSE, obj, 'com/niit/tbr/common/print/DirectPrint', 'setProperty', '(Loracle/forms/properties/ID;Ljava/lang/Object;)Z', args); 
  END;

  -- Method: init (Loracle/forms/handler/IHandler;)V
  PROCEDURE init(
    obj   ORA_JAVA.JOBJECT,
    a0    ORA_JAVA.JOBJECT) IS
  BEGIN
    args := JNI.CREATE_ARG_LIST(1);
    JNI.ADD_OBJECT_ARG(args, a0, 'oracle/forms/handler/IHandler');
    JNI.CALL_VOID_METHOD(FALSE, obj, 'com/niit/tbr/common/print/DirectPrint', 'init', '(Loracle/forms/handler/IHandler;)V', args); 
  END;


BEGIN
  -- BEAN_NAME (Loracle/forms/properties/ID;)
  BEAN_NAME := JNI.GET_OBJECT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'BEAN_NAME', 'Loracle/forms/properties/ID;');
  BEAN_NAME := ORA_JAVA.NEW_GLOBAL_REF(BEAN_NAME);

  -- DEBUG_MODE (Loracle/forms/properties/ID;)
  DEBUG_MODE := JNI.GET_OBJECT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'DEBUG_MODE', 'Loracle/forms/properties/ID;');
  DEBUG_MODE := ORA_JAVA.NEW_GLOBAL_REF(DEBUG_MODE);

  -- DELIVER_EVENT (Loracle/forms/properties/ID;)
  DELIVER_EVENT := JNI.GET_OBJECT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'DELIVER_EVENT', 'Loracle/forms/properties/ID;');
  DELIVER_EVENT := ORA_JAVA.NEW_GLOBAL_REF(DELIVER_EVENT);

  -- FOCUS_EVENT (Loracle/forms/properties/ID;)
  FOCUS_EVENT := JNI.GET_OBJECT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'FOCUS_EVENT', 'Loracle/forms/properties/ID;');
  FOCUS_EVENT := ORA_JAVA.NEW_GLOBAL_REF(FOCUS_EVENT);

  -- KEY_EVENT (Loracle/forms/properties/ID;)
  KEY_EVENT := JNI.GET_OBJECT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'KEY_EVENT', 'Loracle/forms/properties/ID;');
  KEY_EVENT := ORA_JAVA.NEW_GLOBAL_REF(KEY_EVENT);

  -- DEFAULT_COLOR (Ljava/awt/Color;)
  DEFAULT_COLOR_0 := JNI.GET_OBJECT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'DEFAULT_COLOR', 'Ljava/awt/Color;');
  DEFAULT_COLOR_0 := ORA_JAVA.NEW_GLOBAL_REF(DEFAULT_COLOR_0);

  -- MNEMONIC_INDEX_NONE (I)
  MNEMONIC_INDEX_NONE := JNI.GET_INT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'MNEMONIC_INDEX_NONE', 'I');

  -- MNEMONIC_CHAR_NONE (C)
  MNEMONIC_CHAR_NONE := JNI.GET_CHAR_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'MNEMONIC_CHAR_NONE', 'C');

  -- DEFAULT_BORDERPAINTER (Loracle/ewt/painter/BorderPainter;)
  DEFAULT_BORDERPAINTER := JNI.GET_OBJECT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'DEFAULT_BORDERPAINTER', 'Loracle/ewt/painter/BorderPainter;');
  DEFAULT_BORDERPAINTER := ORA_JAVA.NEW_GLOBAL_REF(DEFAULT_BORDERPAINTER);

  -- DEFAULT_PAINTER (Loracle/ewt/painter/Painter;)
  DEFAULT_PAINTER := JNI.GET_OBJECT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'DEFAULT_PAINTER', 'Loracle/ewt/painter/Painter;');
  DEFAULT_PAINTER := ORA_JAVA.NEW_GLOBAL_REF(DEFAULT_PAINTER);

  -- DEFAULT_COLOR (Ljava/awt/Color;)
  DEFAULT_COLOR_1 := JNI.GET_OBJECT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'DEFAULT_COLOR', 'Ljava/awt/Color;');
  DEFAULT_COLOR_1 := ORA_JAVA.NEW_GLOBAL_REF(DEFAULT_COLOR_1);

  -- DEFAULT_FONT (Ljava/awt/Font;)
  DEFAULT_FONT := JNI.GET_OBJECT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'DEFAULT_FONT', 'Ljava/awt/Font;');
  DEFAULT_FONT := ORA_JAVA.NEW_GLOBAL_REF(DEFAULT_FONT);

  -- TOP_ALIGNMENT (F)
  TOP_ALIGNMENT := JNI.GET_FLOAT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'TOP_ALIGNMENT', 'F');

  -- CENTER_ALIGNMENT (F)
  CENTER_ALIGNMENT := JNI.GET_FLOAT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'CENTER_ALIGNMENT', 'F');

  -- BOTTOM_ALIGNMENT (F)
  BOTTOM_ALIGNMENT := JNI.GET_FLOAT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'BOTTOM_ALIGNMENT', 'F');

  -- LEFT_ALIGNMENT (F)
  LEFT_ALIGNMENT := JNI.GET_FLOAT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'LEFT_ALIGNMENT', 'F');

  -- RIGHT_ALIGNMENT (F)
  RIGHT_ALIGNMENT := JNI.GET_FLOAT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'RIGHT_ALIGNMENT', 'F');

  -- WIDTH (I)
  WIDTH := JNI.GET_INT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'WIDTH', 'I');

  -- HEIGHT (I)
  HEIGHT := JNI.GET_INT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'HEIGHT', 'I');

  -- PROPERTIES (I)
  PROPERTIES := JNI.GET_INT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'PROPERTIES', 'I');

  -- SOMEBITS (I)
  SOMEBITS := JNI.GET_INT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'SOMEBITS', 'I');

  -- FRAMEBITS (I)
  FRAMEBITS := JNI.GET_INT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'FRAMEBITS', 'I');

  -- ALLBITS (I)
  ALLBITS := JNI.GET_INT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'ALLBITS', 'I');

  -- ERROR (I)
  ERROR := JNI.GET_INT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'ERROR', 'I');

  -- ABORT (I)
  ABORT := JNI.GET_INT_FIELD(TRUE, NULL, 'com/niit/tbr/common/print/DirectPrint', 'ABORT', 'I');

END;
