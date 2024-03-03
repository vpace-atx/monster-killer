const ATTACK_VALUE = 10;
const STRONG_ATTACK_VALUE = 18;
const MONSTER_ATTACK_VALUE = 14;
const HEAL_VALUE = 10;
const MODE_STRONG_ATTACK = 'STRONG_ATTACK';
const MODE_ATTACK = 'ATTACK';
const LOG_EVENT_PLAYER_ATTACK = 'PLAYER_ATTACK';
const LOG_EVENT_PLAYER_STRONG_ATTACK = 'PLAYER_STRONG_ATTACK';
const LOG_EVENT_MONSTER_ATTACK = 'MONSTER_ATTACK';
const LOG_EVENT_PLAYER_HEAL = 'PLAYER_HEAL';
const LOG_EVENT_GAME_OVER = 'GAME_OVER';

let battleLog = [];
let lastLoggedEntry;

function getMaxLifeValues() {
    const parsedValue = parseInt(prompt('Maximum life for you and the monster.', '100'));
    if (isNaN(parsedValue) || parsedValue <= 0) {
        throw { message: 'Invalid user input, not a number' }
    }
    return parsedValue;
}

let chosenMaxLife;

try {
    chosenMaxLife = getMaxLifeValues();
} catch (error) {
    console.log(error);
    chosenMaxLife = 100;
    alert('You entered something wrong, default value of 100 was used');
}

let currentMonsterHealth = chosenMaxLife;
let currentPlayerHealth = chosenMaxLife;
let hasBonusLife = true;

adjustHealthBars(chosenMaxLife);

function writeToLog(ev, val, monsterHealth, playerHealth) {
    let logEntry = {
        event: ev,
        value: val,
        finalMonsterHealth: monsterHealth,
        finalPlayerHealth: playerHealth
    };
    if (ev === LOG_EVENT_PLAYER_ATTACK || ev === LOG_EVENT_PLAYER_STRONG_ATTACK) {
        logEntry.target = 'MONSTER'
    }
    else if (ev === LOG_EVENT_MONSTER_ATTACK || ev === LOG_EVENT_PLAYER_HEAL) {
        logEntry.target = 'PLAYER'
    }
    battleLog.push(logEntry);
}

function reset() {
    currentMonsterHealth = chosenMaxLife;
    currentPlayerHealth = chosenMaxLife;
    resetGame();
}

function endRound() {
    const initialPlayerHealth = currentPlayerHealth;
    const monsterDamage = dealPlayerDamage(MONSTER_ATTACK_VALUE);
    currentPlayerHealth -= monsterDamage;
    writeToLog(LOG_EVENT_MONSTER_ATTACK, monsterDamage, currentMonsterHealth, currentPlayerHealth);

    if (currentPlayerHealth <= 0 && hasBonusLife) {
        hasBonusLife = false;
        removeBonusLife();
        currentPlayerHealth = initialPlayerHealth;
        setPlayerHealth(initialPlayerHealth);
        alert('Using bonus life');
    }
    if (currentMonsterHealth <= 0 && currentPlayerHealth > 0) {
        alert('You won!');
        writeToLog(LOG_EVENT_GAME_OVER, 'PLAYER WON', currentMonsterHealth, currentPlayerHealth);
        reset();
    }
    else if (currentPlayerHealth <= 0 && currentMonsterHealth > 0) {
        alert('You lost!');
        writeToLog(LOG_EVENT_GAME_OVER, 'MONSTER WON', currentMonsterHealth, currentPlayerHealth);
        reset();
    }
    else if (currentPlayerHealth <= 0 && currentMonsterHealth <= 0) {
        alert('You have a draw!');
        writeToLog(LOG_EVENT_GAME_OVER, 'A DRAW', currentMonsterHealth, currentPlayerHealth);
        reset();
    }
}

function attackMonster(attackMode) {
    const maxDamage = attackMode === MODE_ATTACK ? ATTACK_VALUE : STRONG_ATTACK_VALUE;
    const logEvent = attackMode === MODE_ATTACK ? LOG_EVENT_PLAYER_ATTACK : LOG_EVENT_PLAYER_STRONG_ATTACK;
    const damage = dealMonsterDamage(maxDamage);
    currentMonsterHealth -= damage;
    writeToLog(logEvent, damage, currentMonsterHealth, currentPlayerHealth)
    endRound();
}

function attackHandler() {
    attackMonster(MODE_ATTACK);
}

function strongAttackHandler() {
    attackMonster(MODE_STRONG_ATTACK)
}

function healPlayerHandler() {
    let healValue;
    if (currentPlayerHealth >= chosenMaxLife - HEAL_VALUE) {
        alert('You can\'t heal to more than your max initial health');
        healValue = chosenMaxLife - currentPlayerHealth;
    }
    else {
        healValue = HEAL_VALUE;
    }
    increasePlayerHealth(healValue);
    currentPlayerHealth += healValue;
    writeToLog(LOG_EVENT_PLAYER_HEAL, healValue, currentMonsterHealth, currentPlayerHealth)
    endRound();
}

function printLogHandler() {
    let i = 0;
    for (const logEntry of battleLog) {
        if (!lastLoggedEntry || lastLoggedEntry !== 0 || lastLoggedEntry < i) {
            console.log(`#${i}`);
            console.log(logEntry);
            for (const key in logEntry) {
                console.log(`${key}: ${logEntry[key]}`)
            }
        }
        lastLoggedEntry = i;
        break;
    }
    i++;
}

attackBtn.addEventListener('click', attackHandler);
strongAttackBtn.addEventListener('click', strongAttackHandler);
healBtn.addEventListener('click', healPlayerHandler);
logBtn.addEventListener('click', printLogHandler);