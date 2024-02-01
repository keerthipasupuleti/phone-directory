The procedure `Clear_All_Master_Details` in this PL/SQL block appears to handle the clearing of master and detail blocks in an Oracle Forms application. Let's break down its structure and functionality:

### Procedure: `Clear_All_Master_Details`

#### 1. **Declaration of Local Variables:**
   ```plsql
   mastblk VARCHAR2(30); -- Initial Master Block Cusing Coord
   coordop VARCHAR2(30); -- Operation Causing the Coord
   trigblk VARCHAR2(30); -- Cur Block On-Clear-Details Fires On
   startitm VARCHAR2(61); -- Item in which cursor started
   frmstat VARCHAR2(15); -- Form Status
   curblk VARCHAR2(30); -- Current Block
   currel VARCHAR2(30); -- Current Relation
   curdtl VARCHAR2(30); -- Current Detail Block
   retblk VARCHAR2(30); -- Return Block
   ```
   - **Explanation:**
      - Declaration of local variables used within the procedure.

#### 2. **Function: `First_Changed_Block_Below`**
   ```plsql
   FUNCTION First_Changed_Block_Below(Master VARCHAR2) RETURN VARCHAR2 IS
   ```
   - **Explanation:**
      - A function that recursively searches for the first changed block below a given master block.

#### 3. **Procedure Body:**
   ```plsql
   BEGIN
   ```
   - **Explanation:**
      - Beginning of the main procedure body.

#### 4. **Initialize Local Variables:**
   ```plsql
   mastblk := :System.Master_Block; 
   coordop := :System.Coordination_Operation; 
   trigblk := :System.Trigger_Block; 
   startitm := :System.Trigger_Item; 
   frmstat := :System.Form_Status;
   ```
   - **Explanation:**
      - Initializes local variables with relevant system properties.

#### 5. **Coordination Operation Check:**
   ```plsql
   IF coordop NOT IN ('CLEAR_RECORD', 'SYNCHRONIZE_BLOCKS') THEN
   ```
   - **Explanation:**
      - Checks if the coordination operation is neither 'CLEAR_RECORD' nor 'SYNCHRONIZE_BLOCKS'.

#### 6. **Handling Master Block:**
   ```plsql
   IF mastblk = trigblk THEN
   ```
   - **Explanation:**
      - Checks if the master block is the block that triggered the coordination.

#### 7. **Check Form Status:**
   ```plsql
   IF frmstat = 'CHANGED' THEN
   ```
   - **Explanation:**
      - Checks if the form status is 'CHANGED'.

#### 8. **Find First Changed Block Below:**
   ```plsql
   curblk := First_Changed_Block_Below(mastblk);
   ```
   - **Explanation:**
      - Calls the `First_Changed_Block_Below` function to find the first changed block below the master.

#### 9. **Handle Changed Block:**
   ```plsql
   IF curblk IS NOT NULL THEN
      Go_Block(curblk); 
      Check_Package_Failure; 
      Clear_Block(ASK_COMMIT); 
      
      IF NOT ( :System.Form_Status = 'QUERY' OR :System.Block_Status = 'NEW' ) THEN
         RAISE Form_Trigger_Failure;
      END IF;
   END IF;
   ```
   - **Explanation:**
      - If a changed block is found, it goes to that block, checks for package failure, and clears it with an option to ask for commit.
      - If the user cancels the commit dialog, it raises an error if the form or block status is not as expected.

#### 10. **End of Conditional Checks:**
   ```plsql
   END IF; -- IF frmstat = 'CHANGED'
   END IF; -- IF mastblk = trigblk
   END IF; -- IF coordop NOT IN ('CLEAR_RECORD', 'SYNCHRONIZE_BLOCKS')
   ```
   - **Explanation:**
      - Ends the conditional checks for coordination operation, master block, and form status.

#### 11. **Clear All Detail Blocks:**
   ```plsql
   currel := Get_Block_Property(trigblk, FIRST_MASTER_RELATION);
   WHILE currel IS NOT NULL LOOP
      curdtl := Get_Relation_Property(currel, DETAIL_NAME);
      IF Get_Block_Property(curdtl, STATUS) <> 'NEW' THEN
         Go_Block(curdtl); 
         Check_Package_Failure; 
         Clear_Block(NO_VALIDATE); 
         
         IF :System.Block_Status <> 'NEW' THEN
            RAISE Form_Trigger_Failure;
         END IF;
      END IF;
      currel := Get_Relation_Property(currel, NEXT_MASTER_RELATION);
   END LOOP;
   ```
   - **Explanation:**
      - Clears all detail blocks related to the master block without asking to commit.

#### 12. **Restore Cursor Position:**
   ```plsql
   IF :System.Cursor_Item <> startitm THEN
      Go_Item(startitm); 
      Check_Package_Failure;
   END IF;
   ```
   - **Explanation:**
      - Restores the cursor position to where it started.

#### 13. **Exception Handling:**
   ```plsql
   EXCEPTION 
      WHEN Form_Trigger_Failure THEN
         IF :System.Cursor_Item <> startitm THEN
            Go_Item(startitm);
         END IF;
         RAISE;
   END Clear_All_Master_Details;
   ```
   - **Explanation:**
      - Handles exceptions, restores the cursor if needed, and re-raises the exception.

### Overall Explanation:

This procedure is designed to clear all master and detail blocks based on certain conditions, especially when a master block is changed. It checks the coordination operation, the master block, and the form status before taking specific actions. The recursive function `First_Changed_Block_Below` is utilized to find the first changed block below a given master block. The procedure ensures proper handling and validation throughout the process, raising exceptions when needed.

