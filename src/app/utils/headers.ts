interface LinkHeader {
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
}

// NOTE: This takes a header and parses the links for pagination.
export function parseLinkHeader(header: any): LinkHeader {
  if (header.length === 0) {
    return;
  }

  const parts = header.split(',');
  const links = {};
  parts.forEach((link: string) => {
    const section = link.split(';');
    const url = section[0].replace(/<(.*)>/, '$1').trim();
    const name = section[1].replace(/rel="(.*)"/, '$1').trim();
    links[name] = url;
  });
  return links;
}
