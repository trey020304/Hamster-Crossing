const root = document.documentElement;
let selectedHamster = localStorage.getItem("selectedHamster") || null;

const hamsterAssets = {
    null: { 
        ground: "assets/images/sprites/hamu_ground.png",
        sprite: "assets/images/sprites/hamu_sprite.png",
        character: "assets/images/character_sprites/hamu_hamu.png",
        background: "url('assets/images/backgrounds/bg_tryA.gif'), url('assets/images/backgrounds/bg_hamu.png')",
        music: "assets/sounds/hamu.mp3",

        //for trail
        trailHue: "164",

        //for pathfind logo
        pathfindImg1: "assets/images/pathfinding_logos/pathfinding_hamu_1.png",
        pathfindImg2: "assets/images/pathfinding_logos/pathfinding_hamu_2.png",

        //for buttons & title outlines CSS
        outline: "#ff8e1c",
        shadow: "#d36102",
        gradient: "linear-gradient(to bottom, #f9a65a, #ffbc80)",
        hoverGradient: "linear-gradient(to bottom, #ffa9b8, #ff605f)",
        hoverOutline: "#ff1a14"
    },
    hamu: {
        ground: "assets/images/sprites/hamu_ground.png",
        sprite: "assets/images/sprites/hamu_sprite.png",
        character: "assets/images/character_sprites/hamu_hamu.png",
        background: "url('assets/images/backgrounds/fallbg.gif'), url('assets/images/backgrounds/bg_hamu.png')",
        music: "assets/sounds/hamu.mp3",

        //for trail
        trailHue: "164",

        //for pathfind logo
        pathfindImg1: "assets/images/pathfinding_logos/pathfinding_hamu_1.png",
        pathfindImg2: "assets/images/pathfinding_logos/pathfinding_hamu_2.png",

        //for buttons & title outlines CSS
        outline: "#ff8e1c",
        shadow: "#d36102",
        gradient: "linear-gradient(to bottom, #f9a65a, #ffbc80)",
        hoverGradient: "linear-gradient(to bottom, #ffa9b8, #ff605f)",
        hoverOutline: "#ff1a14"
    },
    merry: {
        ground: "assets/images/sprites/merry_ground.png",
        sprite: "assets/images/sprites/merry_sprite.png",
        character: "assets/images/character_sprites/merry_hamu.png",
        background: "url('assets/images/backgrounds/snowflabg.gif'), url('assets/images/backgrounds/bg_merry1.png')",
        music: "assets/sounds/merry.mp3",

         //for trail
         trailHue: "-70",

        //for pathfind logo
        pathfindImg1: "assets/images/pathfinding_logos/pathfinding_merry_1.png",
        pathfindImg2: "assets/images/pathfinding_logos/pathfinding_merry_2.png",

        //for buttons & title outlines CSS
        outline: "#44bf4d",
        shadow: "#83cf8a",
        gradient: "linear-gradient(to bottom, #64c76d, #aedbb2)",
        hoverGradient: "linear-gradient(to bottom, #d04360, #eb5877)",
        hoverOutline: "#89464e"
    },
    berry: {
        ground: "assets/images/sprites/berry_ground.png",
        sprite: "assets/images/sprites/berry_sprite.png",
        character: "assets/images/character_sprites/berry_hamu.png",
        background: "url('assets/images/backgrounds/heartbg.gif'), url('assets/images/backgrounds/bg_berry.png')",
        music: "assets/sounds/berry.mp3",

        //for pathfind logo
        pathfindImg1: "assets/images/pathfinding_logos/pathfinding_berry_1.png",
        pathfindImg2: "assets/images/pathfinding_logos/pathfinding_berry_2.png",

        //for trail
        trailHue: "121",

        //for buttons & title outlines CSS
        outline: "#ed54a5",
        shadow: "#ffa5ca",
        gradient: "linear-gradient(to bottom, #ff8bbd, #ffb8d7)",
        hoverGradient: "linear-gradient(to bottom, #ffa9b8, #ff605f)",
        hoverOutline: "#ff1a14"
    },
    mint: {
        ground: "assets/images/sprites/mint_ground.png",
        sprite: "assets/images/sprites/mint_sprite.png",
        character: "assets/images/character_sprites/mint_hamu.png",
        background: "url('assets/images/backgrounds/heartmintbg.gif'), url('assets/images/backgrounds/bg_mint.png')",
        music: "assets/sounds/mint.mp3",

        //for trail
        trailHue: "-25",

        //for pathfind logo
        pathfindImg1: "assets/images/pathfinding_logos/pathfinding_mint_1.png",
        pathfindImg2: "assets/images/pathfinding_logos/pathfinding_mint_2.png",

        //for buttons & title outlines CSS
        outline: "#379992",
        shadow: "#93d3d6",
        gradient: "linear-gradient(to bottom, #9dd8d9, #96cbcc)",
        hoverGradient: "linear-gradient(to bottom, #9cccf3, #c3e0f8)",
        hoverOutline: "#489dea"
    },
    hamuStar: {
        ground: "assets/images/sprites/hamuSTAR_ground.png",
        sprite: "assets/images/sprites/hamuSTAR_sprite.png",
        character: "assets/images/character_sprites/hamuSTAR_hamu.png",
        background: "url('assets/images/backgrounds/bg_try.gif'), url('assets/images/backgrounds/bg_merry.png')",
        music: "assets/sounds/hamustar.mp3",

        //for trail
        trailHue: "164",

        //for pathfind logo
        pathfindImg1: "assets/images/pathfinding_logos/pathfinding_hamustar_1.png",
        pathfindImg2: "assets/images/pathfinding_logos/pathfinding_hamustar_2.png",

        //for buttons & title outlines CSS
        outline: "#ff8e1c",
        shadow: "#d36102",
        gradient: "linear-gradient(to bottom, #f9a65a, #ffbc80)",
        hoverGradient: "linear-gradient(to bottom, #ffa9b8, #ff605f)",
        hoverOutline: "#ff1a14"
    },
    chiikawa: {
        ground: "assets/images/sprites/chiikawa_ground.png",
        sprite: "assets/images/sprites/chiikawa_sprite.png",
        character: "assets/images/character_sprites/chiikawa_hamu.png",
        background: "url('assets/images/backgrounds/bg_tryA.gif'), url('assets/images/backgrounds/bg_merry.png')",
        music: "assets/sounds/chiikawa.mp3",

        //for trail
        trailHue: "-127",

        //for pathfind logo
        pathfindImg1: "assets/images/pathfinding_logos/pathfinding_chiikawa_1.png",
        pathfindImg2: "assets/images/pathfinding_logos/pathfinding_chiikawa_2.png",

        //for buttons & title outlines CSS
        outline: "#9ea24a",
        shadow: "#d2db9f",
        gradient: "linear-gradient(to bottom, #c6cb9a, #b1d28a",
        hoverGradient: "linear-gradient(to bottom, #ffa9b8, #ff605f)",
        hoverOutline: "#ff1a14"
    },
};


// Function to get the current assets based on selectedHamster
function getHamsterAssets() {
    return hamsterAssets[selectedHamster] || hamsterAssets.null;
}

// Set up the sprites dynamically
const assets = getHamsterAssets();
const spriteSheet = new Image();
spriteSheet.src = assets.ground;

const hamsterImage = new Image();
hamsterImage.src = assets.character;

const hamsterSpriteSheet = new Image();
hamsterSpriteSheet.src = assets.sprite;


const hueValue = assets.trailHue || 0; 

window.pathfindImages = [assets.pathfindImg1, assets.pathfindImg2];

window.hamsterTheme = assets; 
console.log("Selected hamster assets:", assets);
