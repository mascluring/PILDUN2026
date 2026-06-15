const TEAMS = [
  {
    "flag": "\ud83c\uddf2\ud83c\uddfd",
    "name": "Mexico"
  },
  {
    "flag": "\ud83c\uddf0\ud83c\uddf7",
    "name": "South Korea"
  },
  {
    "flag": "\ud83c\udde8\ud83c\uddff",
    "name": "Czechia"
  },
  {
    "flag": "\ud83c\uddff\ud83c\udde6",
    "name": "South Africa"
  },
  {
    "flag": "\ud83c\udde8\ud83c\udded",
    "name": "Switzerland"
  },
  {
    "flag": "\ud83c\udde8\ud83c\udde6",
    "name": "Canada"
  },
  {
    "flag": "\ud83c\uddf6\ud83c\udde6",
    "name": "Qatar"
  },
  {
    "flag": "\ud83c\udde7\ud83c\udde6",
    "name": "Bosnia & Herzegovina"
  },
  {
    "flag": "\ud83c\udde7\ud83c\uddf7",
    "name": "Brazil"
  },
  {
    "flag": "\ud83c\uddf2\ud83c\udde6",
    "name": "Morocco"
  },
  {
    "flag": "\ud83c\udff4",
    "name": "Scotland"
  },
  {
    "flag": "\ud83c\udded\ud83c\uddf9",
    "name": "Haiti"
  },
  {
    "flag": "\ud83c\uddfa\ud83c\uddf8",
    "name": "United States"
  },
  {
    "flag": "\ud83c\uddf9\ud83c\uddf7",
    "name": "Turkey"
  },
  {
    "flag": "\ud83c\udde6\ud83c\uddfa",
    "name": "Australia"
  },
  {
    "flag": "\ud83c\uddf5\ud83c\uddfe",
    "name": "Paraguay"
  },
  {
    "flag": "\ud83c\udde9\ud83c\uddea",
    "name": "Germany"
  },
  {
    "flag": "\ud83c\uddea\ud83c\udde8",
    "name": "Ecuador"
  },
  {
    "flag": "\ud83c\udde8\ud83c\uddee",
    "name": "Ivory Coast"
  },
  {
    "flag": "\ud83c\udde8\ud83c\uddfc",
    "name": "Cura\u00e7ao"
  },
  {
    "flag": "\ud83c\uddf3\ud83c\uddf1",
    "name": "Netherlands"
  },
  {
    "flag": "\ud83c\uddef\ud83c\uddf5",
    "name": "Japan"
  },
  {
    "flag": "\ud83c\uddf8\ud83c\uddea",
    "name": "Sweden"
  },
  {
    "flag": "\ud83c\uddf9\ud83c\uddf3",
    "name": "Tunisia"
  },
  {
    "flag": "\ud83c\udde7\ud83c\uddea",
    "name": "Belgium"
  },
  {
    "flag": "\ud83c\uddee\ud83c\uddf7",
    "name": "Iran"
  },
  {
    "flag": "\ud83c\uddea\ud83c\uddec",
    "name": "Egypt"
  },
  {
    "flag": "\ud83c\uddf3\ud83c\uddff",
    "name": "New Zealand"
  },
  {
    "flag": "\ud83c\uddea\ud83c\uddf8",
    "name": "Spain"
  },
  {
    "flag": "\ud83c\uddfa\ud83c\uddfe",
    "name": "Uruguay"
  },
  {
    "flag": "\ud83c\uddf8\ud83c\udde6",
    "name": "Saudi Arabia"
  },
  {
    "flag": "\ud83c\udde8\ud83c\uddfb",
    "name": "Cape Verde"
  },
  {
    "flag": "\ud83c\uddeb\ud83c\uddf7",
    "name": "France"
  },
  {
    "flag": "\ud83c\uddf8\ud83c\uddf3",
    "name": "Senegal"
  },
  {
    "flag": "\ud83c\uddf3\ud83c\uddf4",
    "name": "Norway"
  },
  {
    "flag": "\ud83c\uddee\ud83c\uddf6",
    "name": "Iraq"
  },
  {
    "flag": "\ud83c\udde6\ud83c\uddf7",
    "name": "Argentina"
  },
  {
    "flag": "\ud83c\udde6\ud83c\uddf9",
    "name": "Austria"
  },
  {
    "flag": "\ud83c\udde9\ud83c\uddff",
    "name": "Algeria"
  },
  {
    "flag": "\ud83c\uddef\ud83c\uddf4",
    "name": "Jordan"
  },
  {
    "flag": "\ud83c\uddf5\ud83c\uddf9",
    "name": "Portugal"
  },
  {
    "flag": "\ud83c\udde8\ud83c\uddf4",
    "name": "Colombia"
  },
  {
    "flag": "\ud83c\udde8\ud83c\udde9",
    "name": "DR Congo"
  },
  {
    "flag": "\ud83c\uddfa\ud83c\uddff",
    "name": "Uzbekistan"
  },
  {
    "flag": "\ud83c\udff4",
    "name": "England"
  },
  {
    "flag": "\ud83c\udded\ud83c\uddf7",
    "name": "Croatia"
  },
  {
    "flag": "\ud83c\uddf5\ud83c\udde6",
    "name": "Panama"
  },
  {
    "flag": "\ud83c\uddec\ud83c\udded",
    "name": "Ghana"
  }
];

function generateGroupStage(){
  const groups = "ABCDEFGHIJKL".split("");
  const fixtures = [];

  groups.forEach((g,gi)=>{
    const base = gi*4;
    const t = TEAMS.slice(base, base+4);

    const pairs = [
      [0,1],[2,3],[0,2],[1,3],[0,3],[1,2]
    ];

    pairs.forEach(p=>{
      fixtures.push({
        group:g,
        home:t[p[0]].name,
        away:t[p[1]].name
      });
    });
  });

  return fixtures;
}

function buildKnockout(){
  return {
    r32:Array.from({length:16},(_,i)=>({id:i+1})),
    r16:Array.from({length:8},(_,i)=>({id:i+1})),
    qf:Array.from({length:4},(_,i)=>({id:i+1})),
    sf:Array.from({length:2},(_,i)=>({id:i+1})),
    final:[{id:1}]
  };
}
