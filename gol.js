(function () { 
    console.log("creating game");

    const GRID_WIDTH = 100;
    const GRID_HEIGHT = 50;
    
    const CELL_WIDTH = 10;

    const TIME_INTERVAL = 100; // milliseconds

    const SEED = null;

    // a few notable patterns...
    const ALIVE_SEED_GLLIDER = {
        1: [2],
        2: [3],
        3: [1,2,3]
    };
    
    const ALIVE_SEED_GLIDERGUN = {
        1: [25],
        2: [23, 25],
        3: [13, 14, 21, 22, 35, 36],
        4: [12, 16, 21, 22, 35, 36],
        5: [1, 2, 11, 17, 21, 22],
        6: [1, 2, 11, 15, 17, 18, 23, 25],
        7: [11, 17, 25],
        8: [12, 16],
        9: [13, 14]
    };
    
    const ALIVE_SEED_LWSS = {
        1: [1, 4],
        2: [5],
        3: [1, 5],
        4: [2, 3, 4, 5]
    };

    const ALIVE_SEED_PULSAR = {
        2: [4, 5, 6, 10, 11, 12],
        4: [2, 7, 9, 14],
        5: [2, 7, 9, 14],
        6: [2, 7, 9, 14],
        7: [4, 5, 6, 10, 11, 12],
        9: [4, 5, 6, 10, 11, 12],
        10: [2, 7, 9, 14],
        11: [2, 7, 9, 14],
        12: [2, 7, 9, 14],
        14: [4, 5, 6, 10, 11, 12]
    };

    // rather than giving a GRID_WIDTH x GRID_HEIGHT grid as SEED, let's just
    // give the coords of the cells that start as alive. This is a dict whose
    // format is { row_number: [ index, of, alive, cells ], ... }
    const ALIVE_SEED = ALIVE_SEED_GLIDERGUN;

    var Gol = {
        // a 2D array whose elems are cell states: 0 = dead, 1 = alive
        _grid: [],

        // reference to the DOM element where the game is displayed
        _canvas: null,

        // returns an empty grid of GRID_HEIGHT x GRID_WIDTH cells
        _getEmptyGrid: function() {
            var grid = [];
            
            for (var i=0; i<GRID_HEIGHT; i++) {
                grid.push(Array(GRID_WIDTH).fill(0));
            }

            return grid;
        },

        // returns how many living neighbors the cell this._grid[i][j] has
        _countNeighbors: function(i, j) {
            var neighbors = 0;

            // to represent the grid around the target T (T = this._grid[i][j])
            // ---------> j
            // | a b c
            // | d T e
            // | f g h
            // |
            // v i

            if (i > GRID_HEIGHT || j > GRID_WIDTH) {
                return 0;
            }

            if (i > 0) {
                // a alive?
                if (j > 0) {
                    if (this._grid[i-1][j-1] == 1) {
                        neighbors++;
                    }
                }
                
                // b alive?
                if (this._grid[i-1][j] == 1) {
                    neighbors++;
                }

                // c alive?
                if (j < GRID_WIDTH - 2) {
                    if (this._grid[i-1][j+1] == 1) {
                        neighbors++;
                    }
                }
            }
            
            
            // d alive?
            if (j > 0) {    
                if (this._grid[i][j-1] == 1) {
                    neighbors++;
                }
            }

            // e alive?
            if (j < GRID_WIDTH - 2) {
                if (this._grid[i][j+1] == 1) {
                    neighbors++;
                }
            }

            if (i < GRID_HEIGHT -2) {
                // f alive?
                if (j > 0) {
                    if (this._grid[i+1][j-1] == 1) {
                        neighbors++;
                    }
                }

                // g alive?
                if (this._grid[i+1][j] == 1) {
                    neighbors++;
                }

                // h alive?
                if (j < GRID_WIDTH - 2) {
                    if (this._grid[i+1][j+1] == 1) {
                        neighbors++;
                    }
                }
            }

            return neighbors;
        },

        // initialize this._grid
        init: function() {
            console.log("initing game");

            // step 1: initialize the grid state from SEED (if given), or
            // create an empty one
            if (SEED) {
                this._grid = SEED;
            } else {
                this._grid = this._getEmptyGrid();

            }

            // step 2: initialize the grid state from ALIVE_SEED, if given
            if (ALIVE_SEED) {
                for (row in ALIVE_SEED) {
                    if (ALIVE_SEED.hasOwnProperty(row)) {
                        for (var i=0; i<ALIVE_SEED[row].length; i++) {
                            this._grid[row][ALIVE_SEED[row][i]] = 1;
                        }
                    }
                }
            }

            console.log(this._grid);

            // step 3: initialize the HTML canvas grid
            this._canvas = document.getElementById("canvas");
            canvas.style.width = GRID_WIDTH * CELL_WIDTH;
            canvas.style.height = GRID_HEIGHT * CELL_WIDTH;

            for (var i=0; i<GRID_HEIGHT; i++) {
                for (var j=0; j<GRID_WIDTH; j++) {
                    var cell = document.createElement("span");
                    cell.className = "dead";
                    cell.style.width = CELL_WIDTH;
                    cell.style.height = CELL_WIDTH;
                    cell.style.display = "inline-block";
                    this._canvas.appendChild(cell);
                }
            }

            console.log("done initing game");
        },

        // start the game!
        start: function() {
            console.log("Starting game...");
            this.init();

            this.paint();

            setInterval(this.step, TIME_INTERVAL);
        },

        // update all cells' DOM node classes to reflect the current state
        paint() {
            for (var i=0; i<GRID_HEIGHT; i++) {
                for (var j=0; j<GRID_WIDTH; j++) {
                    var child = this._canvas.childNodes[i*GRID_WIDTH + j];
                    child.className = this._grid[i][j] ? "alive" : "dead";
                }
            }
        },

        // compute the next state from the current one, then paint()
        step: function() {
            var newGrid = this._getEmptyGrid();

            for (var i=0; i<GRID_HEIGHT; i++) {
                for (var j=0; j<GRID_WIDTH; j++) {
                    var cell = this._grid[i][j];
                    var neighborCount = this._countNeighbors(i, j);

                    if (cell == 0) {
                        if (neighborCount == 3) {
                            newGrid[i][j] = 1;
                        }
                    } else {
                        if (neighborCount == 2 || neighborCount == 3) {
                            newGrid[i][j] = 1;
                        }
                    }
                }
            }

            this._grid = newGrid;

            this.paint();
        }
    };


    Gol.start = Gol.start.bind(Gol);
    Gol.step = Gol.step.bind(Gol);

    window.onload = Gol.start;
    console.log("Game created");
})();