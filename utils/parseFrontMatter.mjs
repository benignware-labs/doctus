export const parseFrontMatter = (
  content,
  open = ['---', '<!--'],
  close = ['---', '-->']
) => {
  const data = {};
  const lines = content.split('\n');
  let i = 0;

  if (open.includes(lines[i].trim())) {
    i++;
    
    while (!close.includes(lines[i].trim())) {
      const [key, value] = lines[i].split(':');
      
      data[key.trim()] = value.trim();
      i++;
    }
  }
  
  const source = Object.keys(data).length > 0 ? lines.slice(i + 1).join('\n').trim() : content;
  
  return {
    data,
    source
  };
}