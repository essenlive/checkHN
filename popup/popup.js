async function checkHN () {
  // Get current tab URL
  const currentTab = await browser.tabs.query({ currentWindow: true, active: true })
  const currentUrl = new URL(currentTab[0].url);
  const currentTitle = currentTab[0].title;

  // Return if on a weird URL, like settings or something else
  if (currentUrl.host === "") {
    document.getElementById("error").classList.remove('hidden')
    document.getElementById("searching").classList.add('hidden');
    return
  }

  document.getElementById("url").innerText = `${currentUrl.host}${currentUrl.pathname}`

  // Fetch HN stories with the corresponding URL
  let exactMatch = await fetch(`https://hn.algolia.com/api/v1/search?tags=story&query=${currentUrl.origin}${currentUrl.pathname}`)
  exactMatch = await exactMatch.json();

  // Hide the searching element
  document.getElementById("searching").classList.add('hidden');

  // Get the result display element
  const noExactResult = document.getElementById("no-results");
  // Display the first five stories
  exactMatch.hits.slice(0,5).forEach(story => {
    const storyElement = document.createElement('div');    

    const link = document.createElement('a');
    link.setAttribute('href', `https://news.ycombinator.com/item?id=${story.objectID}`);
    link.innerText = story.title;
    
    const author = document.createElement('span');
    author.innerText = `  ${story.author} 🔺 ${story.points} `;

    storyElement.appendChild(link).insertAdjacentElement('afterend', author);
    noExactResult.insertAdjacentElement('beforebegin', storyElement);
  });

  if (exactMatch.nbHits > 0 ) { document.getElementById("matches").classList.add('results'); }
  else{
    const link = document.createElement('a');
    link.setAttribute('href', `https://news.ycombinator.com/submitlink?u=${currentUrl.href}&t=${currentTitle}`);
    link.innerText = " Submit it ?";

    noExactResult.appendChild(link)
    noExactResult.classList.remove('hidden')
  }

  // Check if there are stories on the same website
  let hostMatch;
  // If we were already on the hostname, don't refetch the API
  if (currentUrl.pathname !== '/'){
    hostMatch = await fetch(`https://hn.algolia.com/api/v1/search?tags=story&query=${currentUrl.host}`)
    hostMatch = await hostMatch.json();
  }
  // If there are other stories on the hostname, or all the stories were not displayed, show a link to algolia.
  if (hostMatch?.nbHits > 0 || exactMatch.nbHits > 5) {
    const moreElement = document.createElement('div');
    moreElement.setAttribute('class', 'more-elements');
    
    const emoji = document.createElement('span');
    emoji.setAttribute('class', 'emoji');
    emoji.innerText = "🎉"

    const moreText = document.createElement('span');
    moreText.innerText = ` But there are other results for the same website ${currentUrl.host} : `;

    const link = document.createElement('a');
    link.setAttribute('href', `https://hn.algolia.com/?tags=story&query=${currentUrl.host}` );
    link.innerText = "Wanna check them ?";

    
    moreElement.appendChild(emoji).insertAdjacentElement('afterend', moreText).insertAdjacentElement('afterend',link);
    
    document.getElementById("matches").insertAdjacentElement('afterend', moreElement);
  }

}

checkHN()