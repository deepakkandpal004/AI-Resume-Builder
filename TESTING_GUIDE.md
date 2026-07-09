# 🧪 Resume Builder - Feature Testing Guide
*Interactive Testing Session - July 9, 2026*

---

## 🎯 Testing Order (15-20 minutes total)

We'll test features in order of importance and dependencies.

---

## Test 1: ✅ Redux Persist (Authentication) - 1 minute

### Steps:
1. **Go to:** http://localhost:5173
2. **If not logged in:** Create account or log in
3. **Verify:** You're on the dashboard with your resumes
4. **Action:** Press `F5` or `Ctrl+R` to refresh the page
5. **Expected:** You should STAY logged in (no redirect to login)
6. **Expected:** Your resumes should still be visible

### ✅ Pass Criteria:
- [ ] Page refreshes without logging you out
- [ ] Auth state persists
- [ ] No login screen appears

**Status:** ___________

---

## Test 2: ✅ Lazy Loading (Performance) - 1 minute

### Steps:
1. **Open DevTools:** Press `F12` or `Ctrl+Shift+I`
2. **Go to:** Network tab
3. **Clear:** Click the "Clear" button (🚫 icon)
4. **Reload:** Press `Ctrl+Shift+R` (hard refresh)
5. **Observe:** Multiple JS chunks loading (look for files like `Home-*.js`, `Layout-*.js`)
6. **Navigate:** Go to `/app/builder/[any-resume-id]`
7. **Observe:** New chunk `ResumeBuilder-*.js` loads

### ✅ Pass Criteria:
- [ ] See multiple JS files instead of one large bundle
- [ ] Initial bundle < 500KB
- [ ] New chunks load when navigating
- [ ] Loader component appears briefly

**Status:** ___________

**Note:** Chunk names will have hashes like `Home-a3b4c5d6.js`

---

## Test 3: ✅ Interview Prep Integration - 3 minutes

### Steps:
1. **Navigate:** Dashboard → Open any resume → Resume Builder
2. **Look for:** Sidebar sections (you should see 13 sections now)
3. **Scroll to:** Tools section in sidebar
4. **Click:** "Interview Prep" (should be 4th item in Tools, after ATS Score, Tailor to JD, Cover Letter)
5. **Expected:** Right panel shows Interview Prep interface

### In Interview Prep Panel:
6. **Enter:** Target Role: "Senior Frontend Engineer"
7. **Enter:** Job Description snippet (any 2-3 sentences)
8. **Click:** "Generate Interview Questions"
9. **Wait:** ~5-10 seconds (AI processing)
10. **Expected:** 10 questions appear with categories:
    - Behavioural (blue badge)
    - Technical (purple badge)
    - Situational (amber badge)
    - Role-Specific (emerald badge)

### Test Features:
11. **Click:** A question to expand → See suggested answer
12. **Click:** Copy icon → Should copy Q&A to clipboard
13. **Click:** "Copy All" → Should copy all 10 questions
14. **Click:** "Regenerate" → Should generate new questions
15. **Click:** "History" tab → Should show saved question sets

### ✅ Pass Criteria:
- [ ] Interview Prep tab exists in sidebar
- [ ] Panel loads without errors
- [ ] Questions generate successfully
- [ ] Categories display correctly (color badges)
- [ ] Expand/collapse works
- [ ] Copy buttons work
- [ ] History tab shows saved sets

**Status:** ___________

---

## Test 4: ✅ Keyboard Shortcuts - 2 minutes

### Prerequisites:
- Be on Resume Builder page
- Have a resume open

### Test Each Shortcut:

#### 4.1: Save Shortcut
1. **Edit:** Change any field (e.g., your name)
2. **Press:** `Ctrl+S` (or `Cmd+S` on Mac)
3. **Expected:** 
   - Toast appears: "Saved with Ctrl+S" (1.5 sec)
   - Resume saves
   - Auto-save indicator shows "Saved"

#### 4.2: Export PDF Shortcut
4. **Press:** `Ctrl+E` (or `Cmd+E` on Mac)
5. **Expected:**
   - Toast: "Generating PDF..."
   - PDF downloads after ~3-5 seconds
   - Toast: "PDF exported!"

#### 4.3: Preview Shortcut
6. **Press:** `Ctrl+P` (or `Cmd+P` on Mac)
7. **Expected:**
   - Preview modal/drawer opens
   - Shows live resume preview
   - (On mobile: drawer slides in from right)

#### 4.4: Quick Jump Shortcut
8. **Press:** `Ctrl+K` (or `Cmd+K` on Mac)
9. **Expected:**
   - Quick Jump modal appears
   - Search box is focused
   - Can type to filter sections

#### 4.5: Escape Shortcut
10. **Open:** Any modal (quick jump, preview, etc.)
11. **Press:** `Esc`
12. **Expected:** Modal closes

#### 4.6: Verify Shortcut Disabling
13. **Click:** Resume title to edit
14. **Press:** `Ctrl+S` while typing
15. **Expected:** Should NOT save, allows normal text typing
16. **Press:** `Esc` → Title edit cancels

### ✅ Pass Criteria:
- [ ] Ctrl+S saves and shows toast
- [ ] Ctrl+E exports PDF
- [ ] Ctrl+P opens preview
- [ ] Ctrl+K opens quick jump
- [ ] Esc closes modals
- [ ] Shortcuts disabled during title edit

**Status:** ___________

---

## Test 5: ✅ Mobile UX - Bottom Action Bar - 2 minutes

### Steps:
1. **Open DevTools:** Press `F12`
2. **Toggle Device Toolbar:** Click phone icon or press `Ctrl+Shift+M`
3. **Select:** iPhone 14 Pro or similar
4. **Navigate:** Resume Builder page
5. **Scroll to bottom:** Look for action bar

### Verify Bottom Bar:
6. **Expected:** Sticky bar at bottom with 4 buttons
7. **Buttons visible:**
   - Save (with icon and label)
   - PDF (with icon and label)
   - Preview (with icon and label)
   - History (with icon and label)

### Test Each Button:

#### 5.1: Save Button
8. **Edit:** Any field
9. **Tap:** Save button
10. **Expected:** Resume saves, toast appears

#### 5.2: PDF Button
11. **Tap:** PDF button
12. **Expected:** PDF downloads

#### 5.3: Preview Button
13. **Tap:** Preview button
14. **Expected:** Drawer slides in from right
15. **Expected:** Shows resume preview
16. **Close:** Tap X or backdrop

#### 5.4: History Button
17. **Tap:** History button
18. **Expected:** Version history panel opens

### Verify Spacing:
19. **Scroll:** To bottom of form
20. **Expected:** Content has padding, not hidden by action bar
21. **Expected:** Last form field visible above action bar

### Desktop Check:
22. **Exit:** Device toolbar (back to desktop)
23. **Expected:** Bottom action bar disappears (hidden on desktop)

### ✅ Pass Criteria:
- [ ] Bottom bar visible on mobile
- [ ] All 4 buttons work
- [ ] Content has bottom padding
- [ ] Drawer animation smooth
- [ ] Bar hidden on desktop (lg:hidden)

**Status:** ___________

---

## Test 6: ✅ Unsaved Changes Warning - 2 minutes

### Test Browser Warning:

#### 6.1: Browser Close Warning
1. **Edit:** Any field (e.g., change email)
2. **Wait:** 3 seconds (don't save yet)
3. **Try to close:** Browser tab (click X)
4. **Expected:** Browser shows native warning: "You have unsaved changes"
5. **Cancel:** Stay on page
6. **Save:** Click Save button or Ctrl+S
7. **Try to close:** Tab again
8. **Expected:** No warning, tab closes normally

#### 6.2: Page Navigation Warning
9. **Edit:** Another field
10. **Click:** Browser back button
11. **Expected:** Custom modal appears with:
    - AlertTriangle icon (amber)
    - "Unsaved Changes" heading
    - Message about losing changes
    - "Stay" button
    - "Leave Anyway" button (red)

12. **Click:** "Stay"
13. **Expected:** Modal closes, stays on page

14. **Try again:** Browser back button
15. **Click:** "Leave Anyway"
16. **Expected:** Navigates away, changes lost

#### 6.3: Auto-save Integration
17. **Edit:** A field
18. **Wait:** 2.5 seconds (auto-save triggers)
19. **Observe:** "Saved" indicator appears
20. **Try to leave:** No warning should appear

### ✅ Pass Criteria:
- [ ] Browser shows warning before close
- [ ] Custom modal appears on navigation
- [ ] "Stay" keeps you on page
- [ ] "Leave Anyway" navigates away
- [ ] Auto-save clears warning
- [ ] Manual save clears warning

**Status:** ___________

---

## Test 7: ✅ Error Handling - 2 minutes

### Test Network Error:

#### 7.1: Simulate Network Failure
1. **Open DevTools:** Network tab
2. **Throttle:** Select "Offline" from dropdown
3. **Edit:** Any field
4. **Click:** Save
5. **Expected:** Toast error: "Network error. Please check your connection and try again."
6. **Duration:** Error toast should stay ~4 seconds

#### 7.2: Reconnect & Retry
7. **Throttle:** Back to "No throttling"
8. **Click:** Save again
9. **Expected:** Save succeeds, success toast appears

### Test AI Service Error (Optional):
10. **Go to:** Interview Prep or Cover Letter
11. **Generate:** Multiple times quickly (trigger rate limit)
12. **Expected:** If quota exceeded: "Daily limit reached. Upgrade to premium for unlimited access."
13. **Duration:** 6 seconds (longer for quota errors)

### ✅ Pass Criteria:
- [ ] Network error shows user-friendly message
- [ ] Error toast has appropriate duration
- [ ] Can retry after error
- [ ] AI quota errors have longer toast
- [ ] No console.error in production (only dev)

**Status:** ___________

---

## Test 8: ✅ Input Validation (Utility Ready) - 1 minute

### Note:
The validation utilities are created but not yet integrated into form components. We'll verify they're ready for use.

### Verify Files Exist:
1. **Check:** `src/utils/validation.js` exists
2. **Size:** Should be ~7.2KB

### Quick Integration Test (Optional):
If you want to test validators, open browser console and run:

```javascript
// Copy this into browser console on Resume Builder page
import('/src/utils/validation.js').then(v => {
  console.log('Email validation:', v.validateEmail('test@example.com'));
  console.log('Invalid email:', v.validateEmail('not-an-email'));
  console.log('Phone validation:', v.validatePhone('1234567890'));
  console.log('LinkedIn URL:', v.validateLinkedIn('https://linkedin.com/in/username'));
});
```

**Expected:** Should see validation results with `{valid: true/false, error: string}`

### ✅ Pass Criteria:
- [ ] validation.js file exists
- [ ] Exports 14+ validators
- [ ] Ready for integration into forms

**Status:** ___________

---

## 🎉 Test Summary

### Results:

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Redux Persist | ⬜ | Auth persists on refresh |
| 2 | Lazy Loading | ⬜ | Chunks load on demand |
| 3 | Interview Prep | ⬜ | Tab visible, generates Q&A |
| 4 | Keyboard Shortcuts | ⬜ | 5 shortcuts working |
| 5 | Mobile UX | ⬜ | Bottom bar with 4 buttons |
| 6 | Unsaved Warning | ⬜ | Browser + modal warnings |
| 7 | Error Handling | ⬜ | User-friendly messages |
| 8 | Input Validation | ⬜ | Utilities ready |

**Legend:** ⬜ Not tested | ✅ Pass | ❌ Fail | ⚠️ Issues found

---

## 📊 Final Checklist

After completing all tests, verify:

- [ ] No console errors in browser
- [ ] All features working as expected
- [ ] Mobile responsive
- [ ] Performance improved (lazy loading)
- [ ] Data persistence working
- [ ] User experience smooth

---

## 🐛 Found an Issue?

**Report Format:**
1. Feature name: ___________
2. Expected behavior: ___________
3. Actual behavior: ___________
4. Steps to reproduce: ___________
5. Error message (if any): ___________

---

## ✅ All Tests Passing?

**Next Steps:**
1. Deploy to staging/production
2. Monitor for errors
3. Gather user feedback
4. Plan next improvements

---

**Testing completed on:** ___________  
**Tested by:** ___________  
**Overall status:** ⬜ Pass | ⬜ Fail | ⬜ Issues Found

---

*Happy Testing! 🚀*
