---
description: Add a license file to the project
---

# Add License

Adds a standard open-source license to the project.

## Steps

### 1. Ask User for License Type
Common options:
- **MIT** - Most permissive, recommended for most projects
- **Apache 2.0** - Permissive with patent protection
- **GPL 3.0** - Copyleft, derivative works must also be GPL
- **ISC** - Simplified MIT
- **Unlicense** - Public domain

### 2. Get Author Information
- Name (or use GitHub username)
- Year (current year)

### 3. Create LICENSE File

**MIT License (Recommended):**
```
MIT License

Copyright (c) YEAR AUTHOR_NAME

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**Apache 2.0:**
```
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

### 4. Update README
Add license section to README.md:
```markdown
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

### 5. Update package.json (if exists)
```json
{
  "license": "MIT"
}
```

### 6. Commit License
```powershell
git add LICENSE README.md
git commit -m "Add MIT license"
git push
```

## License Chooser Reference
| License | Permissions | Conditions | Limitations |
|---------|-------------|------------|-------------|
| MIT | Commercial, modify, distribute, private use | License notice | No liability |
| Apache 2.0 | Same as MIT + patent rights | License notice, state changes | No liability, no trademark |
| GPL 3.0 | Same as MIT | Disclose source, same license | No liability |
