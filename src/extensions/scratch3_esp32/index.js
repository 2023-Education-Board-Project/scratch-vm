const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const log = require('../../util/log');
const cast = require('../../util/cast');

const formatMessage = require('format-message');
const BLE = require('../../io/ble');
const Base64Util = require('../../util/base64-util');
const { Console } = require('minilog');

/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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';

/**
 * Enum for esp32 BLE command protocol.
 * 
 * @readonly
 * @enum {number}
 */
const BLECommand = {
    CMD_TASK: 0x81,
};

/**
 * Enum for esp32 BLE func protocol.
 * 
 * @readonly
 * @enum {number}
 */
const PramFunc = {
    FUNC_DISPLAY_TEXT: 0xC1,
    FUNC_LOOP: 0xC2,
    FUNC_WAIT: 0xC3,
};

/**
 * A time interval to wait (in milliseconds) before reporting to the BLE socket
 * that data has stopped coming from the peripheral.
 */
const BLETimeout = 2000;

/**
 * A time interval to wait (in milliseconds) while a block that sends a BLE message is running.
 * @type {number}
 */
const BLESendInterval = 100;

/**
 * A string to report to the BLE socket when the micro:bit has stopped receiving data.
 * @type {string}
 */
const BLEDataStoppedError = 'esp32 extension stopped receiving data';

/**
 * Enum for micro:bit protocol.
 * https://github.com/LLK/scratch-microbit-firmware/blob/master/protocol.md
 * @readonly
 * @enum {string}
 */
const BLEUUID = {
    service: 0xf005,
    rxChar: '5261da01-fa7e-42ab-850b-7c80220097cc',
    txChar: '5261da02-fa7e-42ab-850b-7c80220097cc'
};

/**
 * Manage communication with a esp32 peripheral over a Scrath Link client socket.
 */
class Esp32 {

    /**
     * Construct a Esp32 communication object.
     * @param {Runtime} runtime - the Scratch 3.0 runtime
     * @param {string} extensionId - the id of the extension
     */
	constructor (runtime, extensionId) {

		/**
         * The Scratch 3.0 runtime used to trigger the green flag button.
         * @type {Runtime}
         * @private
         */
        this._runtime = runtime;

		/**
         * The BluetoothLowEnergy connection socket for reading/writing peripheral data.
         * @type {BLE}
         * @private
         */
        this._ble = null;
        this._runtime.registerPeripheralExtension(extensionId, this);

		/**
         * The id of the extension this peripheral belongs to.
         */
        this._extensionId = extensionId;

        /**
         * The most recently received value for each gesture.
         * @type {Object.<string, Object>}
         * @private
         */
        this._sensors = {
            GPIOPins: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        }

		/**
         * Interval ID for data reading timeout.
         * @type {number}
         * @private
         */
        this._timeoutID = null;

        /**
         * A flag that is true while we are busy sending data to the BLE socket.
         * @type {boolean}
         * @private
         */
        this._busy = false;

		/**
         * ID for a timeout which is used to clear the busy flag if it has been
         * true for a long time.
         */
        this._busyTimeoutID = null;

        this.reset = this.reset.bind(this);
        this._onConnect = this._onConnect.bind(this);
        this._onMessage = this._onMessage.bind(this);
	}

	/**
     * @param {string} text - the text to display.
     * @return {string} - a string contains func and data.
     */
    displayText (text) {
        const output = new Uint8Array(text.length);
        for (let i = 0; i < text.length; i++) {
            output[i] = text.charCodeAt(i);
        }
        const cmd = this._funcPrefix(PramFunc.FUNC_DISPLAY_TEXT, output, null);
        return cmd;
    }

    /**
     * @param {number} loop - the text to display.
     * @param {string} func - func script string
     * @return {string} - a string contains func and data.
     */
    loop (loop, func) {
        const output = new Uint8Array(1);
        output[0] = loop;
        const cmd = this._funcPrefix(PramFunc.FUNC_LOOP, output, func);
        return cmd;
    }
    
    /**
     * @param {number} sec - the text to display.
     * @param {string} func - func script string
     * @return {string} - a string contains func and data.
     */
    wait (sec, func) {
        const output = new Uint8Array(1);
        output[0] = sec;
        const cmd = this._funcPrefix(PramFunc.FUNC_WAIT, output, func);
        return cmd;
    }

    /**
     * @param {string} func - the func to run.
     * @return {Promise} - a Promise that resolves when writing to peripheral.
     */
    runTask (func) {
        const output = Base64Util.base64ToUint8Array(func);
        return this.send(BLECommand.CMD_TASK, output);
    }

	/**
     * Called by the runtime when user wants to scan for a peripheral.
     */
    scan () {
        if (this._ble) {
            this._ble.disconnect();
        }
        this._ble = new BLE(this._runtime, this._extensionId, {
            filters: [
                {services: [BLEUUID.service]}
            ]
        }, this._onConnect, this.reset);
    }

	/**
     * Called by the runtime when user wants to connect to a certain peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */
    connect (id) {
        if (this._ble) {
            this._ble.connectPeripheral(id);
        }
    }

    /**
     * Disconnect from the esp32.
     */
    disconnect () {
        if (this._ble) {
            this._ble.disconnect();
        }

        this.reset();
    }


    /**
     * Reset all the state and timeout/interval ids.
     */
    reset () {
        if (this._timeoutID) {
            window.clearTimeout(this._timeoutID);
            this._timeoutID = null;
        }
    }

	/**
     * Return true if connected to the esp32.
     * @return {boolean} - whether the esp32 board is connected.
     */
    isConnected () {
        let connected = false;
        if (this._ble) {
            connected = this._ble.isConnected();
        }
        return connected;
    }

	/**
     * Send a message to the peripheral BLE socket.
     * @param {number} command - the BLE command hex.
     * @param {Uint8Array} message - the message to write
     */
    send (command, message) {
        if (!this.isConnected()) return;
        if (this._busy) return;

        // Set a busy flag so that while we are sending a message and waiting for
        // the response, additional messages are ignored.
        this._busy = true;

        // Set a timeout after which to reset the busy flag. This is used in case
        // a BLE message was sent for which we never received a response, because
        // e.g. the peripheral was turned off after the message was sent. We reset
        // the busy flag after a while so that it is possible to try again later.
        this._busyTimeoutID = window.setTimeout(() => {
            this._busy = false;
        }, 5000);

        const output = new Uint8Array(message.length + 1);
        output[0] = command; // attach command to beginning of message
        for (let i = 0; i < message.length; i++) {
            output[i + 1] = message[i];
        }
        const data = Base64Util.uint8ArrayToBase64(output);

        console.log(output.toString());

        this._ble.write(BLEUUID.service, BLEUUID.txChar, data, 'base64', true).then(
            () => {
                this._busy = false;
                window.clearTimeout(this._busyTimeoutID);
            }
        );
    }

	/**
     * Starts reading data from peripheral after BLE has connected to it.
     * @private
     */
    _onConnect () {
        this._ble.read(BLEUUID.service, BLEUUID.rxChar, true, this._onMessage);
        this._timeoutID = window.setTimeout(
            () => this._ble.handleDisconnectError(BLEDataStoppedError),
            BLETimeout
        );
    }

	/**
     * Process the data from the incoming BLE characteristic.
     * @param {object} base64 - the incoming BLE data.
     * @private
     */
    _onMessage (base64) {
        // parse data
        // 0x 0000 0000 0000 0000
        const data = Base64Util.base64ToUint8Array(base64);

        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < 8; j++) {
                this._sensors.GPIOPins[i + j] = data[i] & (1 << (8 - j));
            }
        }
        
        // cancel disconnect timeout and start a new one
        window.clearTimeout(this._timeoutID);
        this._timeoutID = window.setTimeout(
            () => this._ble.handleDisconnectError(BLEDataStoppedError),
            BLETimeout
        );
    }

    /**
     * Process to make the func to prefix.
     * data structure
     * [func code:1byte][data...]
     * @returns {string} func string
     * @param {number} funcCode - the func hex.
     * @param {Uint8Array} data - the data
     * @param {string} func
     */
    _funcPrefix(funcCode, data, func)
    {
        let output = null;
        if (func != null)
        {
            const suffix = Base64Util.base64ToUint8Array(func);
            output = new Uint8Array(data.length + 1 + suffix.length);
            
            output[0] = funcCode; // attach command to beginning of message
            let i = 0;
            for (; i < data.length; i++) {
                output[i + 1] = data[i];
            }
            for (let j = 0; j < suffix.length; j++, i++) {
                output[i + 1] = suffix[j];
            }
        }
        else
        {
            output = new Uint8Array(data.length + 1);
            output[0] = funcCode; // attach command to beginning of message
            for (let i = 0; i < data.length; i++) {
                output[i + 1] = data[i];
            }
        }
        return Base64Util.uint8ArrayToBase64(output);
    }
}

/**
 * Enum for esp32 board pin states.
 * @readonly
 * @enum {string}
 */
const Esp32PinState = {
    PUSH: 'push',
    PULL: 'pull'
};

/**
 * Scratch 3.0 blocks to interact with a Esp32 peripheral.
 */
class Scratch3Esp32Blocks {

	/**
     * @return {string} - the name of this extension.
     */
    static get EXTENSION_NAME () {
        return 'ESP32 with FreeRTOS';
    }

	/**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID () {
        return 'esp32';
    }

	/**
     * @return {array} - text and values for each pin state menu element
     */
    get PIN_STATE_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'esp32.pinStateMenu.push',
                    default: 'push',
                    description: 'label for on element in pin state picker for esp32 extension'
                }),
                value: Esp32PinState.PUSH
            },
            {
                text: formatMessage({
                    id: 'esp32.pinStateMenu.pull',
                    default: 'pull',
                    description: 'label for off element in pin state picker for esp32 extension'
                }),
                value: Esp32PinState.PULL
            }
        ];
    }
	
	/**
     * Construct a set of Esp32 blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // Create a new Esp32 peripheral instance
        this._peripheral = new Esp32(this.runtime, Scratch3Esp32Blocks.EXTENSION_ID);
    }

	/**
     * @returns {object} metadata for this extension and its blocks.
     */
	getInfo () {
		return {
			id: Scratch3Esp32Blocks.EXTENSION_ID,
			name: Scratch3Esp32Blocks.EXTENSION_NAME,
			blockIconURI: blockIconURI,
			showStatusButton: true,
			blocks: [
				{
					opcode: 'displayText',
					text: formatMessage({
						id: 'esp32.displayText',
						default: 'display text [TEXT]',
						description: 'display text on esp32 board sh1107 display'
					}),
					blockType: BlockType.REPORTER,
					arguments: {
						TEXT: {
							type: ArgumentType.STRING,
							defaultValue: formatMessage({
								id: 'esp32.textToDisplay',
								default: 'Hello world!',
								description: 'display text by i2c'
							})
						}
					}
				},
				{
					opcode: 'displayClear',
					text: formatMessage({
						id: 'esp32.DisplayClear',
						default: 'clear display',
						description: 'clear esp32 display'
					}),
					blockType: BlockType.COMMAND
				},
                {
                    opcode: 'task',
                    text: formatMessage({
                        id: 'esp32.task',
                        default: 'Execute Task [FUNC]',
                        description: 'send task to board'
                    }),
                    blockType : BlockType.COMMAND,
                    arguments: {
						FUNC: {
							type: ArgumentType.STRING,
							defaultValue: formatMessage({
								id: 'esp32.funcData',
								default: '',
								description: 'func to execute'
							})
                        }
					}
                },
                {
                    opcode: 'loop',
                    text: formatMessage({
                        id: 'esp32.loop',
                        default: 'repeat [LOOP] times [FUNC]',
                        description: 'repeat func'
                    }),
                    blockType : BlockType.REPORTER,
                    arguments: {
						LOOP: {
							type: ArgumentType.NUMBER,
							defaultValue: formatMessage({
								id: 'esp32.loopCnt',
								default: 0,
								description: 'loop times'
							})
						},
                        FUNC: {
							type: ArgumentType.STRING,
							defaultValue: formatMessage({
								id: 'esp32.func',
								default: '',
								description: 'func to execute'
							})
						}
					}
                },
                {
                    opcode: 'wait',
                    text: formatMessage({
                        id: 'esp32.wait',
                        default: 'wait [TIME] seconds before [FUNC]',
                        description: 'wait before execute func'
                    }),
                    blockType : BlockType.REPORTER,
                    arguments: {
						TIME: {
							type: ArgumentType.NUMBER,
							defaultValue: formatMessage({
								id: 'esp32.ms',
								default: 0,
								description: 'miliSecond'
							})
						},
                        FUNC: {
							type: ArgumentType.STRING,
							defaultValue: formatMessage({
								id: 'esp32.func',
								default: '',
								description: 'func to execute'
							})
						}
					}
                }
			],
			menus: {
				pinState: {
					acceptReporters: true,
					items: this.PIN_STATE_MENU
				}
			}
		};
	}
	
	/**
     * @param {object} args - the block's arguments.
     * @return {string} - a
	 *
	 */
	displayText (args) {
        const text = String(args.TEXT).substring(0, 19);
        return this._peripheral.displayText(text);
    }

    /**
     * @param {object} args - the block's arguments.
     * @return {string} - a
	 */
	loop (args) {
        return this._peripheral.loop(args.LOOP, args.FUNC);
    }

    /**
     * @param {object} args - the block's arguments.
     * @return {string} - a
	 */
	wait (args) {
        return this._peripheral.wait(args.TIME, args.FUNC);
    }

    /**
     * Turn all 5x5 matrix LEDs off.
     * @return {Promise} - a Promise that resolves after a tick.
     */
    displayClear () {
		/*
        for (let i = 0; i < 5; i++) {
            this._peripheral.ledMatrixState[i] = 0;
        }
        this._peripheral.displayMatrix(this._peripheral.ledMatrixState);
		*/
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, BLESendInterval);
        });
    }
    
    /**
     * @param {object} args - the block's arguments.
     * @return {Promise} - a Promise that resolves after the task is done.
	 *
	 */ 
    task(args)
    {
        const func = String(args.FUNC);
        if (func.length > 0) this._peripheral.runTask(func);
        const yieldDelay = 120 * ((6 * func.length) + 6);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, yieldDelay);
        });
    }

	/**
     * @param {object} args - the block's arguments.
     * @return {boolean} - the touch pin state.
     * @private
     */
    whenPinConnected (args) {
        const pin = parseInt(args.PIN, 10);
        if (isNaN(pin)) return;
        if (pin < 0 || pin > 2) return false;
        return this._peripheral._checkPinState(pin);
    }
}

module.exports = Scratch3Esp32Blocks;
