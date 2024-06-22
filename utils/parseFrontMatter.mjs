export const parseFrontMatter = (content) => {
  const data = {};
  const lines = content.split('\n');
  let i = 0;
  
  if (lines[i] === '---') {
    i++;
    
    while (lines[i] !== '---') {
      const [key, value] = lines[i].split(':');
      
      data[key.trim()] = value.trim();
      i++;
    }
  }
  
  return data;
}