---
description: Generate a UI component with styles
---

# Create Component

Generates a new UI component with proper structure and styling.

## Steps

### 1. Gather Component Info
Ask user for:
- **Component name** (PascalCase, e.g., `Button`, `UserCard`)
- **Framework** (React, Vue, Svelte, or Vanilla JS)
- **With styles?** (CSS modules, styled-components, or plain CSS)

### 2. Determine Component Directory
```
src/
├── components/
│   └── ComponentName/
│       ├── ComponentName.jsx
│       ├── ComponentName.css
│       └── index.js
```

### 3. Generate Component Files

**React Component:**

`ComponentName.jsx`:
```jsx
import React from 'react';
import './ComponentName.css';

const ComponentName = ({ children, className = '', ...props }) => {
  return (
    <div className={`component-name ${className}`} {...props}>
      {children}
    </div>
  );
};

export default ComponentName;
```

`ComponentName.css`:
```css
.component-name {
  /* Base styles */
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background: var(--bg-primary, #ffffff);
  transition: all 0.2s ease;
}

.component-name:hover {
  /* Hover state */
}
```

`index.js`:
```javascript
export { default } from './ComponentName';
```

---

**Vue Component:**

`ComponentName.vue`:
```vue
<template>
  <div class="component-name" v-bind="$attrs">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ComponentName',
  props: {
    // Define props here
  }
}
</script>

<style scoped>
.component-name {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
}
</style>
```

---

**Vanilla JS Component:**

`ComponentName.js`:
```javascript
class ComponentName {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="component-name">
        ${this.options.content || ''}
      </div>
    `;
  }

  bindEvents() {
    // Add event listeners
  }
}

export default ComponentName;
```

### 4. Common Component Types

**Button:**
- Primary, secondary, outline variants
- Size props (sm, md, lg)
- Loading state
- Icon support

**Card:**
- Header, body, footer sections
- Image support
- Clickable variant

**Modal:**
- Overlay backdrop
- Close button
- Animation

**Form Input:**
- Label
- Error state
- Helper text

### 5. Update Exports
Add to `src/components/index.js`:
```javascript
export { default as ComponentName } from './ComponentName';
```
