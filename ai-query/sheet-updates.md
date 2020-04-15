# ChatBot Logs Update Instructions

1. Kick everyone out of sheet
2. Download a copy of the sheet from [portal.office.com](http://office.com/launch/excel) for safe keeping
   1. File > Save As > Download a Copy
3. Go to [portal.azure.com](https://portal.azure.com/)
4. Go to `SOV-COVID-BOT` resource group
5. Go to `SOV-COVID-BOT-ai` analytics
6. Go to Logs
   ![logs](https://i.imgur.com/KZoedub.png)
7. Go to Query Explorer > Shared Queries > `All QAs`
   ![query explorer](https://i.imgur.com/0Gb2Tlg.png)
8. Update `startDate` to approximate start date (plus some extra time for timezones)
9. Select query and hit run
10. Click Export > Export to CSV - Displayed Columns
    ![Export displayed columns](https://i.imgur.com/7yKFnsS.png)
11. Open exported logs
12. Resize timestamp column (so values aren't truncated to displayed values `###`)
    ![resize column](https://i.imgur.com/wGSgfSm.gif)
13. Format as date for easy comparison
    1. Select Column
    2. Right Click any cell > Format Cells
    3. Date > mm/dd/yy hh:mm AM/PM
14. Go to `COVID-BOT-logs.xlsx` in desktop excel client (for better performance)
15. Check for most recent timestamp (should be topmost record)
16. In exported logs, select new records and copy
17. Go to first empty cell on bottom left of sheet
18. Right click to paste - paste as values
    ![paste as values](https://i.imgur.com/3m8q7UH.png)
19. Go to each blue column G through L and re-apply data validation rules on the entire
    1. Select all cells except header
        1. Move to bottom of sheet (<kbd>Ctrl</kbd> + <kbd>↓</kbd>  on first column)
        2. Select last cell in column
        3. Scroll to top using scroll bar
        4. <kbd>Shift</kbd> + Click cell in 2nd row
    2. Apply Data Validation
        1. Go to Data Ribbon
        2. Select Data Validation
           ![Data Validation](https://i.imgur.com/4CFn5tV.png)
        3. If you see a warning to apply data validation to missing cells, do that - that should apply the rules to any missing cells
           ![extend data validation](https://i.imgur.com/A9Ui1Eg.png)
20. Sort by timestamp (newest to oldest)
    ![sort newest to oldest](https://i.imgur.com/UxNwSa5.png)
21. Ensure the changes are successfully auto-saved
    ![saving -> saved](https://i.imgur.com/NRQiHTw.png)
22. Let people know the sheet is available


> **HINT**: If you're feeling a bit cramped for real estate in Azure, try collapsing the blades with the left chevrons
> ![Hide Menu](https://i.imgur.com/MIa1DgH.png)
