
import Phaser from 'phaser';
import libraryImage from './assets/library.jpg';
import playerSpriteSheet from './assets/player-spritesheet.png';
const GAME_WIDTH = 1181;
const GAME_HEIGHT = 1169;
const dialogueHeight = 340;
const dialogueY = GAME_HEIGHT - 190;
const dialogueTop = dialogueY - dialogueHeight / 2;

class LibraryScene extends Phaser.Scene {
    constructor() {
        super('LibraryScene');
    }

    preload() {
    this.load.image('library', libraryImage);

    this.load.spritesheet('player', playerSpriteSheet, {
    frameWidth: 308,
    frameHeight: 320
    });
}

    create() {
      this.isLoggedIn = false;
        // Background
        this.add.image(0, 0, 'library')
            .setOrigin(0, 0)
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        // World boundaries
        this.physics.world.setBounds(40, 60, GAME_WIDTH - 80, GAME_HEIGHT - 100);

        // Player
        this.createPlayer();

        // Collision boundaries
        this.createObstacles();

        // NPC interaction locations
        this.npcs = [
            {
                name: 'Quiz Keeper',
                x: 800,
                y: 370,
                description: 'Your four quizzes and their individual marks.'
            },
            {
                name: 'Assignment Librarian',
                x: 565,
                y: 480,
                description: 'Your four assignments and their individual marks.'
            },
            {
                name: 'Midterm Scholar',
                x: 510,
                y: 770,
                description: 'Your midterm examination question breakdown.'
            },
            {
                name: 'Head Librarian',
                x: 620,
                y: 850,
                description: 'Your final examination question breakdown.'
            },
            {
                name: 'Lab Assistant',
                x: 140,
                y: 920,
                description: 'Your laboratory assessment total.'
            }
        ];


this.assessmentData = {
    quiz: {
        title: 'Quiz Results',
        marks: [
            { name: 'Quiz 1', mark: 8 },
            { name: 'Quiz 2', mark: 0 },
            { name: 'Quiz 3', mark: 9 },
            { name: 'Quiz 4', mark: 0 }
        ],
        average: 8.5 // Read from column I
    },

    assignment: {
        title: 'Assignment Results',
        marks: [
            { name: 'Assignment 1', mark: 18 },
            { name: 'Assignment 2', mark: 0 },
            { name: 'Assignment 3', mark: 16 },
            { name: 'Assignment 4', mark: 0 }
        ],
        average: 17 // Read from column N
    },

    midterm: {
        title: 'Midterm Exam Results',
        marks: [
            { name: 'Question 1', mark: 8 },
            { name: 'Question 2', mark: 0 },
            { name: 'Question 3', mark: 12 }
        ],
        total: 20 // Read from column S
    },

    final: {
        title: 'Final Exam Results',
        marks: [],
        total: 0
    },

    lab: {
        title: 'Laboratory Assessment',
        total: 0 // Read from column O
    }
};


        this.createNPCBlockers();

        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();

        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            E: Phaser.Input.Keyboard.KeyCodes.E,
            ESC: Phaser.Input.Keyboard.KeyCodes.ESC
        });

        // Interaction prompt
        this.prompt = this.add.text(
            GAME_WIDTH / 2,
            GAME_HEIGHT - 75,
            '',
            {
                fontSize: '22px',
                fontFamily: 'monospace',
                color: '#ffffff',
                backgroundColor: '#34251e',
                padding: { x: 14, y: 10 }
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(100)
            .setVisible(false);

        // Dialogue background
        this.dialogueBox = this.add.rectangle(
    GAME_WIDTH / 2,
    dialogueY,
    GAME_WIDTH - 100,
    dialogueHeight,
    0x34251e,
    0.96
)
    .setStrokeStyle(3, 0xd8b985)
    .setScrollFactor(0)
    .setDepth(110)
    .setVisible(false);

// Dialogue text
this.dialogueText = this.add.text(
    90,
    dialogueTop + 55,
    '',
    {
        fontSize: '18px',
        fontFamily: 'monospace',
        color: '#fff4dc',
        wordWrap: { width: GAME_WIDTH - 180 },
        lineSpacing: 6,
        padding: { top: 8, bottom: 8 }
    }
)
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(111)
    .setVisible(false);

        this.activeNPC = null;
        this.interactionDistance = 85;

        // Camera
        this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    
createPlayer() {
    this.player = this.physics.add.sprite(590, 1080, 'player', 0);

    // Character size
    this.player.setScale(0.47);
    this.player.setOrigin(0.5, 0.9);

    this.player.setCollideWorldBounds(true);
    this.player.setDepth(50);

    // Collision body around the character's feet
    this.player.body.setSize(150, 75);
    this.player.body.setOffset(79, 225);

    this.playerSpeed = 180;

    // Walking animations: four frames per direction
    const directions = [
        { key: 'down', start: 0 },
        { key: 'up', start: 4 },
        { key: 'left', start: 8 },
        { key: 'right', start: 12 }
    ];

    directions.forEach((direction) => {
        this.anims.create({
            key: `walk-${direction.key}`,
            frames: this.anims.generateFrameNumbers('player', {
                start: direction.start,
                end: direction.start + 3
            }),
            frameRate: 8,
            repeat: -1
        });
    });

    // Initial facing direction
    this.facing = 'down';

    this.idleFrames = {
        down: 0,
        up: 4,
        left: 8,
        right: 12
    };
}


    createObstacles() {
        // Approximate collision areas for furniture and bookshelves.
        // These are invisible; they only prevent walking through objects.

        const obstacles = [
            { x: 286, y: 277, width: 360, height: 286 },
            { x: 572, y: 300, width: 194, height: 249 },
            { x: 867, y: 277, width: 351, height: 286 },
            { x: 378, y: 577, width: 342, height: 175 },
            { x: 812, y: 757, width: 240, height: 342 },
            { x: 231, y: 987, width: 249, height: 111 },
            { x: 950, y: 987, width: 258, height: 111 }
        ];

        this.obstacles = this.physics.add.staticGroup();

        obstacles.forEach((obstacle) => {
            const object = this.add.rectangle(
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
            );

            this.physics.add.existing(object, true);
            object.setVisible(false);

            this.obstacles.add(object);
        });

        this.physics.add.collider(this.player, this.obstacles);
    }

    createNPCBlockers() {
    this.npcBlockers = this.physics.add.staticGroup();

    this.npcs.forEach((npc) => {
        const blocker = this.add.rectangle(
            npc.x,
            npc.y + 8,
            46,
            38,
            0xff0000,
            0
        );

        this.physics.add.existing(blocker, true);
        this.npcBlockers.add(blocker);
    });

    this.physics.add.collider(this.player, this.npcBlockers);
}


isAvailable(value) {
    return value !== null &&
           value !== undefined &&
           value !== '' &&
           Number(value) !== 0 &&
           Number.isFinite(Number(value));
}

getAssessmentKey(npcName) {
    const mapping = {
        'Quiz Keeper': 'quiz',
        'Assignment Librarian': 'assignment',
        'Midterm Scholar': 'midterm',
        'Head Librarian': 'final',
        'Lab Assistant': 'lab'
    };

    return mapping[npcName];
}



buildAssessmentText(npc) {
    const key = this.getAssessmentKey(npc.name);
    const assessment = this.assessmentData[key];

    if (!assessment) {
        return `${npc.name}\n\nNo assessment information available.`;
    }

    let output = `${npc.name}\n`;
    output += `${assessment.title}\n\n`;

    // Lab: display only the total
    if (key === 'lab') {
        if (!this.isAvailable(assessment.total)) {
            output += 'Lab marks have not been updated yet.';
        } else {
            output += `Lab Total: ${assessment.total}`;
        }

        return output;
    }

    // Display available individual marks only
    const availableMarks = assessment.marks.filter(item =>
        this.isAvailable(item.mark)
    );

    if (availableMarks.length === 0) {
        output += 'No marks available yet.';
    } else {
        availableMarks.forEach(item => {
            output += `${item.name}: ${item.mark}\n`;
        });
    }

    // Quiz and assignment averages come directly from the spreadsheet
    if (key === 'quiz' && this.isAvailable(assessment.average)) {
        output += `\nBest 3 Quiz Average: ${assessment.average}`;
    }

    else if (key === 'assignment' && this.isAvailable(assessment.average)) {
        output += `\nAssignment Average: ${assessment.average}`;
    }

    // Midterm and final totals
    else if (key === 'midterm' || key === 'final') {
        if (this.isAvailable(assessment.total)) {
            output += `\nTotal: ${assessment.total}`;
        }
    }

    return output;
}

    loadStudentData(student) {
    this.studentName = student.name;

    this.assessmentData = {
        quiz: {
            title: 'Quiz Results',
            marks: student.quiz.marks.map((mark, index) => ({
                name: `Quiz ${index + 1}`,
                mark: mark
            })),
            average: student.quiz.average
        },

        assignment: {
            title: 'Assignment Results',
            marks: student.assignment.marks.map((mark, index) => ({
                name: `Assignment ${index + 1}`,
                mark: mark
            })),
            average: student.assignment.average
        },

        midterm: {
            title: 'Midterm Exam Results',
            marks: student.midterm.marks.map((mark, index) => ({
                name: `Question ${index + 1}`,
                mark: mark
            })),
            total: student.midterm.total
        },

        final: {
            title: 'Final Exam Results',
            marks: (student.final?.marks || []).map((mark, index) => ({
                name: `Question ${index + 1}`,
                mark: mark
            })),
            total: student.final?.total
        },

        lab: {
            title: 'Laboratory Assessment',
            total: student.lab.total
        }
    };

    this.isLoggedIn = true;
}


    update() {

        if (!this.isLoggedIn) {
            this.player.setVelocity(0);
            return;
        }
        if (this.activeNPC) {
            this.player.setVelocity(0);

            if (Phaser.Input.Keyboard.JustDown(this.keys.E) ||
                Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
                this.closeDialogue();
            }

            return;
        }

        this.handleMovement();
        this.checkNPCProximity();
    }

    handleMovement() {
    const body = this.player.body;

    body.setVelocity(0);

    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;

    // Horizontal movement
    if (left) {
        body.setVelocityX(-this.playerSpeed);
    } else if (right) {
        body.setVelocityX(this.playerSpeed);
    }

    // Vertical movement
    if (up) {
        body.setVelocityY(-this.playerSpeed);
    } else if (down) {
        body.setVelocityY(this.playerSpeed);
    }

    // Normalize diagonal movement
    body.velocity.normalize().scale(this.playerSpeed);

    const moving = body.velocity.length() > 0;

    if (moving) {
        // Determine which direction the character faces
        if (up) {
            this.facing = 'up';
        } else if (down) {
            this.facing = 'down';
        } else if (left) {
            this.facing = 'left';
        } else if (right) {
            this.facing = 'right';
        }

        // Play the corresponding walking animation
        this.player.play(`walk-${this.facing}`, true);

    } else {
        // Stop animation and retain the last facing direction
        this.player.anims.stop();

        this.player.setFrame(this.idleFrames[this.facing]);
    }
}

    checkNPCProximity() {
        let nearestNPC = null;
        let nearestDistance = Infinity;

        this.npcs.forEach((npc) => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                npc.x,
                npc.y
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestNPC = npc;
            }
        });

        if (nearestNPC && nearestDistance < this.interactionDistance) {
            this.prompt.setText(`Press E to talk to ${nearestNPC.name}`);
            this.prompt.setVisible(true);

            if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
                this.openDialogue(nearestNPC);
            }
        } else {
            this.prompt.setVisible(false);
        }
    }

    
openDialogue(npc) {
    this.activeNPC = npc;

    this.prompt.setVisible(false);
    this.dialogueBox.setVisible(true);

    this.dialogueText.setText(
        this.buildAssessmentText(npc) +
        '\n\nPress E or ESC to close.'
    );

    this.dialogueText.setVisible(true);
}


    closeDialogue() {
        this.activeNPC = null;
        this.dialogueBox.setVisible(false);
        this.dialogueText.setVisible(false);
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',

    width: GAME_WIDTH,
    height: GAME_HEIGHT,

    backgroundColor: '#211a17',

    pixelArt: true,
    antialias: false,

    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: [LibraryScene]
};


const game = new Phaser.Game(config);


// Apps Script communication bridge
const APPS_SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbxiWDof0mmhObQwz08aM8qSPzlIdKTOzl6LnIJRjg-VAbBcOWIMQWhU-jZpI8yoyCF_vg/exec';

const bridgeFrame = document.createElement('iframe');
bridgeFrame.src = APPS_SCRIPT_URL + '?bridge=1';
bridgeFrame.style.display = 'none';
document.body.appendChild(bridgeFrame);

let bridgeReady = false;

bridgeFrame.addEventListener('load', () => {
    bridgeReady = true;
});

// Login form
const loginForm = document.getElementById('login-form');
const loginButton = document.getElementById('login-button');
const loginError = document.getElementById('login-error');

let loginRequestId = null;

window.addEventListener('message', (event) => {
    const hostname = (() => {
        try {
            return new URL(event.origin).hostname;
        } catch {
            return '';
        }
    })();

    const validOrigin =
        hostname === 'script.google.com' ||
        hostname.endsWith('.googleusercontent.com');

    if (event.source !== bridgeFrame.contentWindow || !validOrigin) {
        return;
    }

    const data = event.data;

    if (!data || data.requestId !== loginRequestId) return;

    loginButton.disabled = false;
    loginButton.textContent = 'Enter the Library';
    loginRequestId = null;

    if (data.type === 'LOGIN_ERROR') {
        loginError.textContent =
            'Unable to connect. Please try again later.';
        console.error('Login error:', data.message);
        return;
    }

    if (data.type !== 'LOGIN_RESULT') return;

    const response = data.response;

    if (!response || !response.success) {
        loginError.textContent =
            response?.message || 'Login failed. Please try again.';
        return;
    }

    // Load this student's marks into the game
    const scene = game.scene.getScene('LibraryScene');
    scene.loadStudentData(response.student);

    // Hide the login screen
    document.getElementById('login-screen').style.display = 'none';
});

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const studentId = document.getElementById('student-id').value.trim();
    const pin = document.getElementById('student-pin').value.trim();

    loginError.textContent = '';

    if (!bridgeReady) {
        loginError.textContent =
            'Connecting to the server. Please try again in a moment.';
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = 'Checking credentials...';

    loginRequestId = String(Date.now()) + '-' +
        Math.random().toString(36).slice(2);

    bridgeFrame.contentWindow.postMessage({
        type: 'LOGIN_REQUEST',
        requestId: loginRequestId,
        studentId: studentId,
        pin: pin
    }, '*');
});


