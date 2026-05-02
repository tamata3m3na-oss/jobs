import os
import re

def find_links_with_multiple_children(directory):
    link_pattern = re.compile(r'<Link\b[^>]*>(.*?)</Link>', re.DOTALL)
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx'):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                    matches = link_pattern.finditer(content)
                    for match in matches:
                        inner_content = match.group(1).strip()
                        # This is a naive check. If there's more than one top-level JSX element or text node, it might have multiple children.
                        # But for simplicity, we can look for cases where there's a tag AND some text, or multiple tags.
                        
                        # Count top-level elements (approximate)
                        # Remove comments
                        inner_content = re.sub(r'{\/\*.*?\*\/}', '', inner_content, flags=re.DOTALL)
                        
                        # If it contains both a tag and non-whitespace text outside of tags, it might have multiple children.
                        # Or if it has multiple tags at the top level.
                        
                        # Simplified: if it has any tag AND any other tag or non-whitespace text.
                        # Actually, Next.js Link throws if there's more than one React child.
                        # A string is one child. An element is one child.
                        
                        tags = re.findall(r'<[A-Z][a-zA-Z0-9]*', inner_content)
                        # We also care about lucide icons which start with uppercase.
                        
                        # Let's just look for the known cases.
                        if '<' in inner_content and ('{' in inner_content or inner_content.strip().startswith('Text') or '\n' in inner_content):
                            # This is still too broad.
                            pass

                # Let's just use grep and manual check for now, or a better regex.
                pass

if __name__ == "__main__":
    # find_links_with_multiple_children('/home/engine/project/frontend/src')
    pass
