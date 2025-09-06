const { test, expect } = require('@playwright/test');

test.describe('Todo App Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the todo app
    await page.goto('./index.html');
    await page.waitForLoadState('networkidle');
  });

  test('should load the todo app successfully', async ({ page }) => {
    // Check if the main title is visible
    await expect(page.locator('h1')).toContainText('오늘의 할일');
    
    // Check if the input field is present
    await expect(page.locator('#todo-input')).toBeVisible();
    
    // Check if the add button is present
    await expect(page.locator('#add-btn')).toBeVisible();
    
    // Check if filter buttons are present
    await expect(page.locator('[data-filter="all"]')).toBeVisible();
    await expect(page.locator('[data-filter="active"]')).toBeVisible();
    await expect(page.locator('[data-filter="completed"]')).toBeVisible();
  });

  test('should add a new todo item', async ({ page }) => {
    const todoText = 'Test todo item';
    
    // Type in the input field
    await page.fill('#todo-input', todoText);
    
    // Check that the add button is enabled
    await expect(page.locator('#add-btn')).toBeEnabled();
    
    // Click the add button
    await page.click('#add-btn');
    
    // Check that the todo item appears in the list
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-text')).toContainText(todoText);
    
    // Check that the input field is cleared
    await expect(page.locator('#todo-input')).toHaveValue('');
    
    // Check that the add button is disabled again
    await expect(page.locator('#add-btn')).toBeDisabled();
  });

  test('should add todo with Enter key', async ({ page }) => {
    const todoText = 'Test todo with Enter key';
    
    // Type in the input field and press Enter
    await page.fill('#todo-input', todoText);
    await page.press('#todo-input', 'Enter');
    
    // Check that the todo item appears
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-text')).toContainText(todoText);
  });

  test('should not add empty todo', async ({ page }) => {
    // Try to add empty todo
    await page.fill('#todo-input', '   '); // Only spaces
    await page.click('#add-btn');
    
    // Check that no todo items are added
    await expect(page.locator('.todo-item')).toHaveCount(0);
    
    // Check that empty state is still shown
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('should toggle todo completion', async ({ page }) => {
    // Add a todo item
    await page.fill('#todo-input', 'Test todo for completion');
    await page.click('#add-btn');
    
    // Check initial state
    const checkbox = page.locator('.checkbox');
    await expect(checkbox).not.toBeChecked();
    
    // Click the checkbox to complete
    await checkbox.click();
    
    // Check that it's now checked
    await expect(checkbox).toBeChecked();
    
    // Check that the todo item has completed class
    await expect(page.locator('.todo-item')).toHaveClass(/completed/);
  });

  test('should delete a todo item', async ({ page }) => {
    // Add a todo item
    await page.fill('#todo-input', 'Test todo for deletion');
    await page.click('#add-btn');
    
    // Hover over the todo item to show delete button
    await page.hover('.todo-item');
    
    // Click the delete button
    await page.click('.delete-btn');
    
    // Check that the todo item is removed
    await expect(page.locator('.todo-item')).toHaveCount(0);
    
    // Check that empty state is shown
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('should filter todos correctly', async ({ page }) => {
    // Add multiple todo items
    await page.fill('#todo-input', 'First todo');
    await page.click('#add-btn');
    
    await page.fill('#todo-input', 'Second todo');
    await page.click('#add-btn');
    
    // Complete the first todo
    await page.locator('.checkbox').first().click();
    
    // Test "Active" filter
    await page.click('[data-filter="active"]');
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-text')).toContainText('Second todo');
    
    // Test "Completed" filter
    await page.click('[data-filter="completed"]');
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-text')).toContainText('First todo');
    
    // Test "All" filter
    await page.click('[data-filter="all"]');
    await expect(page.locator('.todo-item')).toHaveCount(2);
  });

  test('should update statistics correctly', async ({ page }) => {
    // Check initial statistics
    await expect(page.locator('#total-todos')).toContainText('0');
    await expect(page.locator('#completed-todos')).toContainText('0');
    await expect(page.locator('#completion-rate')).toContainText('0%');
    
    // Add a todo
    await page.fill('#todo-input', 'Test todo');
    await page.click('#add-btn');
    
    // Check updated statistics
    await expect(page.locator('#total-todos')).toContainText('1');
    await expect(page.locator('#completed-todos')).toContainText('0');
    await expect(page.locator('#completion-rate')).toContainText('0%');
    
    // Complete the todo
    await page.locator('.checkbox').click();
    
    // Check final statistics
    await expect(page.locator('#total-todos')).toContainText('1');
    await expect(page.locator('#completed-todos')).toContainText('1');
    await expect(page.locator('#completion-rate')).toContainText('100%');
  });

  test('should persist data in localStorage', async ({ page }) => {
    // Add a todo
    await page.fill('#todo-input', 'Persistent todo');
    await page.click('#add-btn');
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that the todo is still there
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-text')).toContainText('Persistent todo');
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Test Ctrl+Enter shortcut
    await page.fill('#todo-input', 'Keyboard shortcut test');
    await page.keyboard.press('Control+Enter');
    
    // Check that the todo was added
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-text')).toContainText('Keyboard shortcut test');
    
    // Test Escape key
    await page.fill('#todo-input', 'This should be cleared');
    await page.keyboard.press('Escape');
    
    // Check that the input is cleared
    await expect(page.locator('#todo-input')).toHaveValue('');
  });

  test('should display empty state correctly', async ({ page }) => {
    // Check initial empty state
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.empty-state h3')).toContainText('할일이 없습니다');
    
    // Add and then delete a todo
    await page.fill('#todo-input', 'Temporary todo');
    await page.click('#add-btn');
    await page.hover('.todo-item');
    await page.click('.delete-btn');
    
    // Check that empty state is shown again
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that the app still works on mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#todo-input')).toBeVisible();
    await expect(page.locator('#add-btn')).toBeVisible();
    
    // Test adding a todo on mobile
    await page.fill('#todo-input', 'Mobile test todo');
    await page.click('#add-btn');
    
    await expect(page.locator('.todo-item')).toHaveCount(1);
  });
});
