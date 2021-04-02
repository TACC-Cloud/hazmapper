export function parseLinkHeader(header: any) {
  if (header.length == 0) {
    return;
  }

  let parts = header.split(',');
  let links = {};
  parts.forEach((link: string) => {
    let section = link.split(';');
    let url = section[0].replace(/<(.*)>/, '$1').trim();
    let name = section[1].replace(/rel="(.*)"/, '$1').trim();
    links[name] = url;
  });
  return links;
}
