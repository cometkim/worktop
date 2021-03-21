import { suite } from 'uvu';
import { randomBytes } from 'crypto';
import * as assert from 'uvu/assert';
import * as utils from './utils';

// @ts-ignore
import isUUID from 'is-uuid';

globalThis.crypto = {
	// @ts-ignore
	getRandomValues(arr: Uint8Array) {
		return randomBytes(arr.length);
	}
};

// ---

const HEX = suite('HEX');

HEX('should be an Array', () => {
	assert.instance(utils.HEX, Array);
});

HEX('should have 256 values', () => {
	assert.is(utils.HEX.length, 256);
});

HEX('should have correct values', () => {
	assert.is(utils.HEX[0], '00');
	assert.is(utils.HEX[10], '0a');
	assert.is(utils.HEX[255], 'ff');
	assert.is(utils.HEX[256], undefined);

	for (let i = 0; i < 256; i++) {
		assert.is(utils.HEX[i], i.toString(16).padStart(2, '0'));
	}
});

HEX.run();

// ---

// https://github.com/lukeed/uid/blob/master/test/secure.js
const uid = suite('uid');

uid('should be a function', () => {
	assert.type(utils.uid, 'function');
});

uid('should return 11-character string (default)', () => {
	let output = utils.uid();
	assert.type(output, 'string');
	assert.is(output.length, 11);
});

uid('length :: 4', () => {
	let i=0, tmp;
	for (; i < 1e3; i++) {
		tmp = utils.uid(4);
		assert.is(tmp.length, 4, `"${tmp}" is not 4 characters!`);
	}
});

uid('length :: 5', () => {
	let i=0, tmp;
	for (; i < 1e3; i++) {
		tmp = utils.uid(5);
		assert.is(tmp.length, 5, `"${tmp}" is not 5 characters!`);
	}
});

uid('length :: 6', () => {
	let i=0, tmp;
	for (; i < 1e3; i++) {
		tmp = utils.uid(6);
		assert.is(tmp.length, 6, `"${tmp}" is not 6 characters!`);
	}
});

uid('unique', () => {
	let items = new Set();
	for (let i=1e6; i--;) items.add(utils.uid());
	assert.is(items.size, 1e6, '~> 1,000,000 uniques');
});

uid.run();

// ---

// https://github.com/lukeed/uuid/blob/master/test/secure.js
const uuid = suite('uuid');

uuid('exports', () => {
	assert.type(utils.uuid, 'function', 'exports function');
});

uuid('returns', () => {
	let out = utils.uuid();
	assert.type(out, 'string', 'returns a string');
	assert.is(out.length, 36, '~> 36 characters long');
});

uuid('unique', () => {
	let length = 1e6;
	assert.is.not(utils.uuid(), utils.uuid(), '~> single');
	let unique = new Set(Array.from({ length }, utils.uuid));
	assert.is(unique.size, length, '~> 1,000,000 uniques');
});

uuid('validate', () => {
	let arr = Array.from({ length: 1e3 }, utils.uuid);
	assert.ok(arr.every(isUUID.v4));
});

uuid.run();

// ---

const byteLength = suite('byteLength');

byteLength('should be a function', () => {
	assert.type(utils.byteLength, 'function');
});

byteLength('should return 0 for empty inputs', () => {
	assert.is(utils.byteLength(), 0);
	assert.is(utils.byteLength(undefined), 0);
	assert.is(utils.byteLength(''), 0);
});

byteLength('should return 0 for empty inputs', () => {
	assert.is(utils.byteLength(), 0);
	assert.is(utils.byteLength(undefined), 0);
	assert.is(utils.byteLength(''), 0);
});

byteLength('should return the correct value', () => {
	assert.is(utils.byteLength('1'), 1);
	assert.is(utils.byteLength('123'), 3);
	assert.is(utils.byteLength('🙌🏼'), 8);
});

byteLength.run();

// ---

const Encoder = suite('Encoder');

Encoder('should be a `TextEncoder` instance', () => {
	assert.instance(utils.Encoder, TextEncoder);
});

Encoder('should have the `encode` method', () => {
	assert.type(utils.Encoder.encode, 'function');
});

Encoder.run();

// ---

const Decoder = suite('Decoder');

Decoder('should be a `TextDecoder` instance', () => {
	assert.instance(utils.Decoder, TextDecoder);
});

Decoder('should have the `decode` method', () => {
	assert.type(utils.Decoder.decode, 'function');
});

Decoder.run();

// ---

const encode = suite('encode');

encode('should be a function', () => {
	assert.type(utils.encode, 'function');
});

encode('should return `Uint8Array` output', () => {
	assert.instance(utils.encode(''), Uint8Array);
});

encode('should return encoded values', () => {
	assert.equal(
		utils.encode('hello'),
		new Uint8Array([104, 101, 108, 108, 111])
	);

	assert.equal(
		utils.encode('world'),
		new Uint8Array([119, 111, 114, 108, 100])
	);

	assert.equal(
		utils.encode(''),
		new Uint8Array([])
	);

	assert.equal(
		utils.encode(' '),
		new Uint8Array([32])
	);

	assert.equal(
		utils.encode('€'),
		new Uint8Array([226, 130, 172])
	);
});

encode.run();

// ---

const decode = suite('decode');

decode('should be a function', () => {
	assert.type(utils.decode, 'function');
});

decode('should return `string` output', () => {
	assert.type(utils.decode(new Uint8Array), 'string');
});

// TODO: add `stream` option tests
decode('should return decoded values', () => {
	assert.equal(
		utils.decode(new Uint8Array([104, 101, 108, 108, 111])),
		'hello',
	);

	assert.equal(
		utils.decode(new Uint8Array([119, 111, 114, 108, 100])),
		'world',
	);

	assert.equal(
		utils.decode(new Uint8Array([])),
		'',
	);

	assert.equal(
		utils.decode(new Uint8Array([32])),
		' ',
	);

	assert.equal(
		utils.decode(new Uint8Array([226, 130, 172])),
		'€',
	);
});

decode.run();
