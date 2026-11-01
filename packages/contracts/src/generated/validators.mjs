// Generated standalone validators; no runtime eval or Function constructor.
import * as runtime0 from "ajv-formats/dist/formats.js";
import * as runtime1 from "ajv/dist/runtime/ucs2length.js";
function __runtime(name) { let value; switch (name) { case "ajv-formats/dist/formats": value = runtime0; break; case "ajv/dist/runtime/ucs2length": value = runtime1; break; default: throw new Error("Unsupported validator runtime"); } return value.default && typeof value.default === "object" ? { ...value, ...value.default } : value; }
"use strict";
export const Circuit = validate53;
const schema20 = {"type":"object","additionalProperties":false,"required":["id","name","countryCode","timeZone","lengthKm","turns","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"name":{"type":"string"},"countryCode":{"type":"string"},"timeZone":{"type":"string"},"lengthKm":{"type":["string","null"],"pattern":"^-?[0-9]+(?:\\.[0-9]{1,3})?$"},"turns":{"type":["integer","null"]},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};
const func1 = Object.prototype.hasOwnProperty;
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats4 = __runtime("ajv-formats/dist/formats").fullFormats["date-time"];
const pattern3 = new RegExp("^-?[0-9]+(?:\\.[0-9]{1,3})?$", "u");
const schema21 = {"type":"object","additionalProperties":false,"required":["sourceId","sourceCode","mode","fetchedAt","attribution","timeZone"],"properties":{"sourceId":{"type":"string","format":"uuid"},"sourceCode":{"type":"string"},"mode":{"enum":["mock","licensed"]},"fetchedAt":{"type":"string","format":"date-time"},"attribution":{"type":"string"},"timeZone":{"type":"string"}}};

function validate54(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate54.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((((data.sourceId === undefined) && (missing0 = "sourceId")) || ((data.sourceCode === undefined) && (missing0 = "sourceCode"))) || ((data.mode === undefined) && (missing0 = "mode"))) || ((data.fetchedAt === undefined) && (missing0 = "fetchedAt"))) || ((data.attribution === undefined) && (missing0 = "attribution"))) || ((data.timeZone === undefined) && (missing0 = "timeZone"))){
validate54.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((((key0 === "sourceId") || (key0 === "sourceCode")) || (key0 === "mode")) || (key0 === "fetchedAt")) || (key0 === "attribution")) || (key0 === "timeZone"))){
validate54.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.sourceId !== undefined){
let data0 = data.sourceId;
const _errs2 = errors;
if(errors === _errs2){
if(errors === _errs2){
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
validate54.errors = [{instancePath:instancePath+"/sourceId",schemaPath:"#/properties/sourceId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate54.errors = [{instancePath:instancePath+"/sourceId",schemaPath:"#/properties/sourceId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.sourceCode !== undefined){
const _errs4 = errors;
if(typeof data.sourceCode !== "string"){
validate54.errors = [{instancePath:instancePath+"/sourceCode",schemaPath:"#/properties/sourceCode/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.mode !== undefined){
let data2 = data.mode;
const _errs6 = errors;
if(!((data2 === "mock") || (data2 === "licensed"))){
validate54.errors = [{instancePath:instancePath+"/mode",schemaPath:"#/properties/mode/enum",keyword:"enum",params:{allowedValues: schema21.properties.mode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.fetchedAt !== undefined){
let data3 = data.fetchedAt;
const _errs7 = errors;
if(errors === _errs7){
if(errors === _errs7){
if(typeof data3 === "string"){
if(!(formats4.validate(data3))){
validate54.errors = [{instancePath:instancePath+"/fetchedAt",schemaPath:"#/properties/fetchedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate54.errors = [{instancePath:instancePath+"/fetchedAt",schemaPath:"#/properties/fetchedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.attribution !== undefined){
const _errs9 = errors;
if(typeof data.attribution !== "string"){
validate54.errors = [{instancePath:instancePath+"/attribution",schemaPath:"#/properties/attribution/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.timeZone !== undefined){
const _errs11 = errors;
if(typeof data.timeZone !== "string"){
validate54.errors = [{instancePath:instancePath+"/timeZone",schemaPath:"#/properties/timeZone/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
else {
validate54.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate54.errors = vErrors;
return errors === 0;
}
validate54.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate53(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate53.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((((data.id === undefined) && (missing0 = "id")) || ((data.name === undefined) && (missing0 = "name"))) || ((data.countryCode === undefined) && (missing0 = "countryCode"))) || ((data.timeZone === undefined) && (missing0 = "timeZone"))) || ((data.lengthKm === undefined) && (missing0 = "lengthKm"))) || ((data.turns === undefined) && (missing0 = "turns"))) || ((data.provenance === undefined) && (missing0 = "provenance"))) || ((data.dataStatus === undefined) && (missing0 = "dataStatus"))) || ((data.updatedAt === undefined) && (missing0 = "updatedAt"))){
validate53.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema20.properties, key0))){
validate53.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(errors === _errs2){
if(errors === _errs2){
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
validate53.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate53.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.name !== undefined){
const _errs4 = errors;
if(typeof data.name !== "string"){
validate53.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.countryCode !== undefined){
const _errs6 = errors;
if(typeof data.countryCode !== "string"){
validate53.errors = [{instancePath:instancePath+"/countryCode",schemaPath:"#/properties/countryCode/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.timeZone !== undefined){
const _errs8 = errors;
if(typeof data.timeZone !== "string"){
validate53.errors = [{instancePath:instancePath+"/timeZone",schemaPath:"#/properties/timeZone/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.lengthKm !== undefined){
let data4 = data.lengthKm;
const _errs10 = errors;
if((typeof data4 !== "string") && (data4 !== null)){
validate53.errors = [{instancePath:instancePath+"/lengthKm",schemaPath:"#/properties/lengthKm/type",keyword:"type",params:{type: schema20.properties.lengthKm.type},message:"must be string,null"}];
return false;
}
if(errors === _errs10){
if(typeof data4 === "string"){
if(!pattern3.test(data4)){
validate53.errors = [{instancePath:instancePath+"/lengthKm",schemaPath:"#/properties/lengthKm/pattern",keyword:"pattern",params:{pattern: "^-?[0-9]+(?:\\.[0-9]{1,3})?$"},message:"must match pattern \""+"^-?[0-9]+(?:\\.[0-9]{1,3})?$"+"\""}];
return false;
}
}
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.turns !== undefined){
let data5 = data.turns;
const _errs12 = errors;
if((!((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5)))) && (data5 !== null)){
validate53.errors = [{instancePath:instancePath+"/turns",schemaPath:"#/properties/turns/type",keyword:"type",params:{type: schema20.properties.turns.type},message:"must be integer,null"}];
return false;
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.provenance !== undefined){
const _errs14 = errors;
if(!(validate54(data.provenance, {instancePath:instancePath+"/provenance",parentData:data,parentDataProperty:"provenance",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
errors = vErrors.length;
}
var valid0 = _errs14 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataStatus !== undefined){
let data7 = data.dataStatus;
const _errs15 = errors;
if(!((((data7 === "synthetic") || (data7 === "current")) || (data7 === "stale")) || (data7 === "corrected"))){
validate53.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema20.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs15 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.updatedAt !== undefined){
let data8 = data.updatedAt;
const _errs16 = errors;
if(errors === _errs16){
if(errors === _errs16){
if(typeof data8 === "string"){
if(!(formats4.validate(data8))){
validate53.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate53.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs16 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate53.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate53.errors = vErrors;
return errors === 0;
}
validate53.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const CircuitDetailV2 = validate56;
const schema22 = {"type":"object","additionalProperties":false,"required":["data","dataMode"],"properties":{"data":{"$ref":"#/$defs/Circuit"},"dataMode":{"enum":["mock","licensed"]}}};

function validate56(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate56.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.data === undefined) && (missing0 = "data")) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate56.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "data") || (key0 === "dataMode"))){
validate56.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.data !== undefined){
const _errs2 = errors;
if(!(validate53(data.data, {instancePath:instancePath+"/data",parentData:data,parentDataProperty:"data",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate53.errors : vErrors.concat(validate53.errors);
errors = vErrors.length;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataMode !== undefined){
let data1 = data.dataMode;
const _errs3 = errors;
if(!((data1 === "mock") || (data1 === "licensed"))){
validate56.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema22.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate56.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate56.errors = vErrors;
return errors === 0;
}
validate56.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const CircuitPageV2 = validate58;
const schema23 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/Circuit"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};
const func2 = __runtime("ajv/dist/runtime/ucs2length").default;
const pattern4 = new RegExp("^[a-f0-9]{64}$", "u");

function validate58(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate58.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((data.items === undefined) && (missing0 = "items")) || ((data.nextCursor === undefined) && (missing0 = "nextCursor"))) || ((data.snapshotVersion === undefined) && (missing0 = "snapshotVersion"))) || ((data.snapshotId === undefined) && (missing0 = "snapshotId"))) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate58.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate58.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.items !== undefined){
let data0 = data.items;
const _errs2 = errors;
if(errors === _errs2){
if(Array.isArray(data0)){
var valid1 = true;
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
const _errs4 = errors;
if(!(validate53(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate53.errors : vErrors.concat(validate53.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate58.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.nextCursor !== undefined){
let data2 = data.nextCursor;
const _errs5 = errors;
if((typeof data2 !== "string") && (data2 !== null)){
validate58.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema23.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate58.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
return false;
}
}
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotVersion !== undefined){
let data3 = data.snapshotVersion;
const _errs7 = errors;
if(errors === _errs7){
if(typeof data3 === "string"){
if(!pattern4.test(data3)){
validate58.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate58.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotId !== undefined){
let data4 = data.snapshotId;
const _errs9 = errors;
if((typeof data4 !== "string") && (data4 !== null)){
validate58.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema23.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate58.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataMode !== undefined){
let data5 = data.dataMode;
const _errs11 = errors;
if(!((((data5 === "mock") || (data5 === "licensed")) || (data5 === "mixed")) || (data5 === "empty"))){
validate58.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema23.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
else {
validate58.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate58.errors = vErrors;
return errors === 0;
}
validate58.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const Driver = validate60;
const schema24 = {"type":"object","additionalProperties":false,"required":["id","name","countryCode","carNumber","biography","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"name":{"type":"string"},"countryCode":{"type":["string","null"]},"carNumber":{"type":["integer","null"]},"biography":{"type":["string","null"]},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};

function validate60(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate60.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((((((data.id === undefined) && (missing0 = "id")) || ((data.name === undefined) && (missing0 = "name"))) || ((data.countryCode === undefined) && (missing0 = "countryCode"))) || ((data.carNumber === undefined) && (missing0 = "carNumber"))) || ((data.biography === undefined) && (missing0 = "biography"))) || ((data.provenance === undefined) && (missing0 = "provenance"))) || ((data.dataStatus === undefined) && (missing0 = "dataStatus"))) || ((data.updatedAt === undefined) && (missing0 = "updatedAt"))){
validate60.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((((((key0 === "id") || (key0 === "name")) || (key0 === "countryCode")) || (key0 === "carNumber")) || (key0 === "biography")) || (key0 === "provenance")) || (key0 === "dataStatus")) || (key0 === "updatedAt"))){
validate60.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(errors === _errs2){
if(errors === _errs2){
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
validate60.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate60.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.name !== undefined){
const _errs4 = errors;
if(typeof data.name !== "string"){
validate60.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.countryCode !== undefined){
let data2 = data.countryCode;
const _errs6 = errors;
if((typeof data2 !== "string") && (data2 !== null)){
validate60.errors = [{instancePath:instancePath+"/countryCode",schemaPath:"#/properties/countryCode/type",keyword:"type",params:{type: schema24.properties.countryCode.type},message:"must be string,null"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.carNumber !== undefined){
let data3 = data.carNumber;
const _errs8 = errors;
if((!((typeof data3 == "number") && (!(data3 % 1) && !isNaN(data3)))) && (data3 !== null)){
validate60.errors = [{instancePath:instancePath+"/carNumber",schemaPath:"#/properties/carNumber/type",keyword:"type",params:{type: schema24.properties.carNumber.type},message:"must be integer,null"}];
return false;
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.biography !== undefined){
let data4 = data.biography;
const _errs10 = errors;
if((typeof data4 !== "string") && (data4 !== null)){
validate60.errors = [{instancePath:instancePath+"/biography",schemaPath:"#/properties/biography/type",keyword:"type",params:{type: schema24.properties.biography.type},message:"must be string,null"}];
return false;
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.provenance !== undefined){
const _errs12 = errors;
if(!(validate54(data.provenance, {instancePath:instancePath+"/provenance",parentData:data,parentDataProperty:"provenance",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
errors = vErrors.length;
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataStatus !== undefined){
let data6 = data.dataStatus;
const _errs13 = errors;
if(!((((data6 === "synthetic") || (data6 === "current")) || (data6 === "stale")) || (data6 === "corrected"))){
validate60.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema24.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs13 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.updatedAt !== undefined){
let data7 = data.updatedAt;
const _errs14 = errors;
if(errors === _errs14){
if(errors === _errs14){
if(typeof data7 === "string"){
if(!(formats4.validate(data7))){
validate60.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate60.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs14 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
else {
validate60.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate60.errors = vErrors;
return errors === 0;
}
validate60.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const DriverDetailV2 = validate62;
const schema25 = {"type":"object","additionalProperties":false,"required":["data","dataMode"],"properties":{"data":{"$ref":"#/$defs/Driver"},"dataMode":{"enum":["mock","licensed"]}}};

function validate62(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate62.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.data === undefined) && (missing0 = "data")) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate62.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "data") || (key0 === "dataMode"))){
validate62.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.data !== undefined){
const _errs2 = errors;
if(!(validate60(data.data, {instancePath:instancePath+"/data",parentData:data,parentDataProperty:"data",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate60.errors : vErrors.concat(validate60.errors);
errors = vErrors.length;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataMode !== undefined){
let data1 = data.dataMode;
const _errs3 = errors;
if(!((data1 === "mock") || (data1 === "licensed"))){
validate62.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema25.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate62.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate62.errors = vErrors;
return errors === 0;
}
validate62.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const DriverPageV2 = validate64;
const schema26 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/Driver"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};

function validate64(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate64.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((data.items === undefined) && (missing0 = "items")) || ((data.nextCursor === undefined) && (missing0 = "nextCursor"))) || ((data.snapshotVersion === undefined) && (missing0 = "snapshotVersion"))) || ((data.snapshotId === undefined) && (missing0 = "snapshotId"))) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate64.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate64.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.items !== undefined){
let data0 = data.items;
const _errs2 = errors;
if(errors === _errs2){
if(Array.isArray(data0)){
var valid1 = true;
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
const _errs4 = errors;
if(!(validate60(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate60.errors : vErrors.concat(validate60.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate64.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.nextCursor !== undefined){
let data2 = data.nextCursor;
const _errs5 = errors;
if((typeof data2 !== "string") && (data2 !== null)){
validate64.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema26.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate64.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
return false;
}
}
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotVersion !== undefined){
let data3 = data.snapshotVersion;
const _errs7 = errors;
if(errors === _errs7){
if(typeof data3 === "string"){
if(!pattern4.test(data3)){
validate64.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate64.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotId !== undefined){
let data4 = data.snapshotId;
const _errs9 = errors;
if((typeof data4 !== "string") && (data4 !== null)){
validate64.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema26.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate64.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataMode !== undefined){
let data5 = data.dataMode;
const _errs11 = errors;
if(!((((data5 === "mock") || (data5 === "licensed")) || (data5 === "mixed")) || (data5 === "empty"))){
validate64.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema26.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
else {
validate64.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate64.errors = vErrors;
return errors === 0;
}
validate64.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const LatestNewsItem = validate66;
const schema27 = {"type":"object","additionalProperties":false,"required":["title","url","publishedAt","summary","titleZh","summaryZh","translationStatus"],"properties":{"title":{"type":"string","minLength":1,"maxLength":300},"url":{"type":"string","format":"uri","maxLength":2000},"publishedAt":{"type":["string","null"],"format":"date-time"},"summary":{"type":"string","maxLength":1200},"titleZh":{"type":["string","null"],"maxLength":600},"summaryZh":{"type":["string","null"],"maxLength":1800},"translationStatus":{"enum":["machine","edited","unavailable","original"]}}};
const formats16 = __runtime("ajv-formats/dist/formats").fullFormats.uri;

function validate66(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate66.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((data.title === undefined) && (missing0 = "title")) || ((data.url === undefined) && (missing0 = "url"))) || ((data.publishedAt === undefined) && (missing0 = "publishedAt"))) || ((data.summary === undefined) && (missing0 = "summary"))) || ((data.titleZh === undefined) && (missing0 = "titleZh"))) || ((data.summaryZh === undefined) && (missing0 = "summaryZh"))) || ((data.translationStatus === undefined) && (missing0 = "translationStatus"))){
validate66.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((((key0 === "title") || (key0 === "url")) || (key0 === "publishedAt")) || (key0 === "summary")) || (key0 === "titleZh")) || (key0 === "summaryZh")) || (key0 === "translationStatus"))){
validate66.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.title !== undefined){
let data0 = data.title;
const _errs2 = errors;
if(errors === _errs2){
if(typeof data0 === "string"){
if(func2(data0) > 300){
validate66.errors = [{instancePath:instancePath+"/title",schemaPath:"#/properties/title/maxLength",keyword:"maxLength",params:{limit: 300},message:"must NOT have more than 300 characters"}];
return false;
}
else {
if(func2(data0) < 1){
validate66.errors = [{instancePath:instancePath+"/title",schemaPath:"#/properties/title/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
}
}
else {
validate66.errors = [{instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.url !== undefined){
let data1 = data.url;
const _errs4 = errors;
if(errors === _errs4){
if(errors === _errs4){
if(typeof data1 === "string"){
if(func2(data1) > 2000){
validate66.errors = [{instancePath:instancePath+"/url",schemaPath:"#/properties/url/maxLength",keyword:"maxLength",params:{limit: 2000},message:"must NOT have more than 2000 characters"}];
return false;
}
else {
if(!(formats16(data1))){
validate66.errors = [{instancePath:instancePath+"/url",schemaPath:"#/properties/url/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""}];
return false;
}
}
}
else {
validate66.errors = [{instancePath:instancePath+"/url",schemaPath:"#/properties/url/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.publishedAt !== undefined){
let data2 = data.publishedAt;
const _errs6 = errors;
if((typeof data2 !== "string") && (data2 !== null)){
validate66.errors = [{instancePath:instancePath+"/publishedAt",schemaPath:"#/properties/publishedAt/type",keyword:"type",params:{type: schema27.properties.publishedAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs6){
if(errors === _errs6){
if(typeof data2 === "string"){
if(!(formats4.validate(data2))){
validate66.errors = [{instancePath:instancePath+"/publishedAt",schemaPath:"#/properties/publishedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.summary !== undefined){
let data3 = data.summary;
const _errs8 = errors;
if(errors === _errs8){
if(typeof data3 === "string"){
if(func2(data3) > 1200){
validate66.errors = [{instancePath:instancePath+"/summary",schemaPath:"#/properties/summary/maxLength",keyword:"maxLength",params:{limit: 1200},message:"must NOT have more than 1200 characters"}];
return false;
}
}
else {
validate66.errors = [{instancePath:instancePath+"/summary",schemaPath:"#/properties/summary/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.titleZh !== undefined){
let data4 = data.titleZh;
const _errs10 = errors;
if((typeof data4 !== "string") && (data4 !== null)){
validate66.errors = [{instancePath:instancePath+"/titleZh",schemaPath:"#/properties/titleZh/type",keyword:"type",params:{type: schema27.properties.titleZh.type},message:"must be string,null"}];
return false;
}
if(errors === _errs10){
if(typeof data4 === "string"){
if(func2(data4) > 600){
validate66.errors = [{instancePath:instancePath+"/titleZh",schemaPath:"#/properties/titleZh/maxLength",keyword:"maxLength",params:{limit: 600},message:"must NOT have more than 600 characters"}];
return false;
}
}
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.summaryZh !== undefined){
let data5 = data.summaryZh;
const _errs12 = errors;
if((typeof data5 !== "string") && (data5 !== null)){
validate66.errors = [{instancePath:instancePath+"/summaryZh",schemaPath:"#/properties/summaryZh/type",keyword:"type",params:{type: schema27.properties.summaryZh.type},message:"must be string,null"}];
return false;
}
if(errors === _errs12){
if(typeof data5 === "string"){
if(func2(data5) > 1800){
validate66.errors = [{instancePath:instancePath+"/summaryZh",schemaPath:"#/properties/summaryZh/maxLength",keyword:"maxLength",params:{limit: 1800},message:"must NOT have more than 1800 characters"}];
return false;
}
}
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.translationStatus !== undefined){
let data6 = data.translationStatus;
const _errs14 = errors;
if(!((((data6 === "machine") || (data6 === "edited")) || (data6 === "unavailable")) || (data6 === "original"))){
validate66.errors = [{instancePath:instancePath+"/translationStatus",schemaPath:"#/properties/translationStatus/enum",keyword:"enum",params:{allowedValues: schema27.properties.translationStatus.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs14 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
else {
validate66.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate66.errors = vErrors;
return errors === 0;
}
validate66.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const LatestNewsResponse = validate67;
const schema28 = {"type":"object","additionalProperties":false,"required":["status","sourceName","sourceUrl","termsUrl","usage","checkedAt","syncedAt","expiresAt","sourceUpdatedAt","newestPublishedAt","items"],"properties":{"status":{"enum":["ready","pending","upstream_error","disabled"]},"sourceName":{"enum":["BBC Sport","NOBI Racing"]},"sourceUrl":{"enum":["https://www.bbc.co.uk/sport/formula1","https://github.com/f1db/f1db"]},"termsUrl":{"enum":["https://www.bbc.co.uk/usingthebbc/terms-of-use/#15metadataandrssfeeds","https://creativecommons.org/licenses/by/4.0/"]},"usage":{"enum":["personal-local-only","public-open-data"]},"checkedAt":{"type":["string","null"],"format":"date-time"},"syncedAt":{"type":["string","null"],"format":"date-time"},"expiresAt":{"type":["string","null"],"format":"date-time"},"sourceUpdatedAt":{"type":["string","null"],"format":"date-time"},"newestPublishedAt":{"type":["string","null"],"format":"date-time"},"items":{"type":"array","maxItems":20,"items":{"$ref":"#/$defs/LatestNewsItem"}}}};

function validate67(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate67.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((((((data.status === undefined) && (missing0 = "status")) || ((data.sourceName === undefined) && (missing0 = "sourceName"))) || ((data.sourceUrl === undefined) && (missing0 = "sourceUrl"))) || ((data.termsUrl === undefined) && (missing0 = "termsUrl"))) || ((data.usage === undefined) && (missing0 = "usage"))) || ((data.checkedAt === undefined) && (missing0 = "checkedAt"))) || ((data.syncedAt === undefined) && (missing0 = "syncedAt"))) || ((data.expiresAt === undefined) && (missing0 = "expiresAt"))) || ((data.sourceUpdatedAt === undefined) && (missing0 = "sourceUpdatedAt"))) || ((data.newestPublishedAt === undefined) && (missing0 = "newestPublishedAt"))) || ((data.items === undefined) && (missing0 = "items"))){
validate67.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema28.properties, key0))){
validate67.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.status !== undefined){
let data0 = data.status;
const _errs2 = errors;
if(!((((data0 === "ready") || (data0 === "pending")) || (data0 === "upstream_error")) || (data0 === "disabled"))){
validate67.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema28.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.sourceName !== undefined){
let data1 = data.sourceName;
const _errs3 = errors;
if(!((data1 === "BBC Sport") || (data1 === "NOBI Racing"))){
validate67.errors = [{instancePath:instancePath+"/sourceName",schemaPath:"#/properties/sourceName/enum",keyword:"enum",params:{allowedValues: schema28.properties.sourceName.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.sourceUrl !== undefined){
let data2 = data.sourceUrl;
const _errs4 = errors;
if(!((data2 === "https://www.bbc.co.uk/sport/formula1") || (data2 === "https://github.com/f1db/f1db"))){
validate67.errors = [{instancePath:instancePath+"/sourceUrl",schemaPath:"#/properties/sourceUrl/enum",keyword:"enum",params:{allowedValues: schema28.properties.sourceUrl.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.termsUrl !== undefined){
let data3 = data.termsUrl;
const _errs5 = errors;
if(!((data3 === "https://www.bbc.co.uk/usingthebbc/terms-of-use/#15metadataandrssfeeds") || (data3 === "https://creativecommons.org/licenses/by/4.0/"))){
validate67.errors = [{instancePath:instancePath+"/termsUrl",schemaPath:"#/properties/termsUrl/enum",keyword:"enum",params:{allowedValues: schema28.properties.termsUrl.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.usage !== undefined){
let data4 = data.usage;
const _errs6 = errors;
if(!((data4 === "personal-local-only") || (data4 === "public-open-data"))){
validate67.errors = [{instancePath:instancePath+"/usage",schemaPath:"#/properties/usage/enum",keyword:"enum",params:{allowedValues: schema28.properties.usage.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.checkedAt !== undefined){
let data5 = data.checkedAt;
const _errs7 = errors;
if((typeof data5 !== "string") && (data5 !== null)){
validate67.errors = [{instancePath:instancePath+"/checkedAt",schemaPath:"#/properties/checkedAt/type",keyword:"type",params:{type: schema28.properties.checkedAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs7){
if(errors === _errs7){
if(typeof data5 === "string"){
if(!(formats4.validate(data5))){
validate67.errors = [{instancePath:instancePath+"/checkedAt",schemaPath:"#/properties/checkedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.syncedAt !== undefined){
let data6 = data.syncedAt;
const _errs9 = errors;
if((typeof data6 !== "string") && (data6 !== null)){
validate67.errors = [{instancePath:instancePath+"/syncedAt",schemaPath:"#/properties/syncedAt/type",keyword:"type",params:{type: schema28.properties.syncedAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data6 === "string"){
if(!(formats4.validate(data6))){
validate67.errors = [{instancePath:instancePath+"/syncedAt",schemaPath:"#/properties/syncedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.expiresAt !== undefined){
let data7 = data.expiresAt;
const _errs11 = errors;
if((typeof data7 !== "string") && (data7 !== null)){
validate67.errors = [{instancePath:instancePath+"/expiresAt",schemaPath:"#/properties/expiresAt/type",keyword:"type",params:{type: schema28.properties.expiresAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs11){
if(errors === _errs11){
if(typeof data7 === "string"){
if(!(formats4.validate(data7))){
validate67.errors = [{instancePath:instancePath+"/expiresAt",schemaPath:"#/properties/expiresAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.sourceUpdatedAt !== undefined){
let data8 = data.sourceUpdatedAt;
const _errs13 = errors;
if((typeof data8 !== "string") && (data8 !== null)){
validate67.errors = [{instancePath:instancePath+"/sourceUpdatedAt",schemaPath:"#/properties/sourceUpdatedAt/type",keyword:"type",params:{type: schema28.properties.sourceUpdatedAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs13){
if(errors === _errs13){
if(typeof data8 === "string"){
if(!(formats4.validate(data8))){
validate67.errors = [{instancePath:instancePath+"/sourceUpdatedAt",schemaPath:"#/properties/sourceUpdatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs13 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.newestPublishedAt !== undefined){
let data9 = data.newestPublishedAt;
const _errs15 = errors;
if((typeof data9 !== "string") && (data9 !== null)){
validate67.errors = [{instancePath:instancePath+"/newestPublishedAt",schemaPath:"#/properties/newestPublishedAt/type",keyword:"type",params:{type: schema28.properties.newestPublishedAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs15){
if(errors === _errs15){
if(typeof data9 === "string"){
if(!(formats4.validate(data9))){
validate67.errors = [{instancePath:instancePath+"/newestPublishedAt",schemaPath:"#/properties/newestPublishedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs15 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.items !== undefined){
let data10 = data.items;
const _errs17 = errors;
if(errors === _errs17){
if(Array.isArray(data10)){
if(data10.length > 20){
validate67.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/maxItems",keyword:"maxItems",params:{limit: 20},message:"must NOT have more than 20 items"}];
return false;
}
else {
var valid1 = true;
const len0 = data10.length;
for(let i0=0; i0<len0; i0++){
const _errs19 = errors;
if(!(validate66(data10[i0], {instancePath:instancePath+"/items/" + i0,parentData:data10,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate66.errors : vErrors.concat(validate66.errors);
errors = vErrors.length;
}
var valid1 = _errs19 === errors;
if(!valid1){
break;
}
}
}
}
else {
validate67.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs17 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate67.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate67.errors = vErrors;
return errors === 0;
}
validate67.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const OfficialNewsItem = validate69;
const schema29 = {"type":"object","additionalProperties":false,"required":["title","url","publishedAt"],"properties":{"title":{"type":"string","maxLength":300},"url":{"type":"string","format":"uri","maxLength":2000},"publishedAt":{"type":["string","null"],"format":"date-time"}}};

function validate69(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate69.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((data.title === undefined) && (missing0 = "title")) || ((data.url === undefined) && (missing0 = "url"))) || ((data.publishedAt === undefined) && (missing0 = "publishedAt"))){
validate69.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((key0 === "title") || (key0 === "url")) || (key0 === "publishedAt"))){
validate69.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.title !== undefined){
let data0 = data.title;
const _errs2 = errors;
if(errors === _errs2){
if(typeof data0 === "string"){
if(func2(data0) > 300){
validate69.errors = [{instancePath:instancePath+"/title",schemaPath:"#/properties/title/maxLength",keyword:"maxLength",params:{limit: 300},message:"must NOT have more than 300 characters"}];
return false;
}
}
else {
validate69.errors = [{instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.url !== undefined){
let data1 = data.url;
const _errs4 = errors;
if(errors === _errs4){
if(errors === _errs4){
if(typeof data1 === "string"){
if(func2(data1) > 2000){
validate69.errors = [{instancePath:instancePath+"/url",schemaPath:"#/properties/url/maxLength",keyword:"maxLength",params:{limit: 2000},message:"must NOT have more than 2000 characters"}];
return false;
}
else {
if(!(formats16(data1))){
validate69.errors = [{instancePath:instancePath+"/url",schemaPath:"#/properties/url/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""}];
return false;
}
}
}
else {
validate69.errors = [{instancePath:instancePath+"/url",schemaPath:"#/properties/url/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.publishedAt !== undefined){
let data2 = data.publishedAt;
const _errs6 = errors;
if((typeof data2 !== "string") && (data2 !== null)){
validate69.errors = [{instancePath:instancePath+"/publishedAt",schemaPath:"#/properties/publishedAt/type",keyword:"type",params:{type: schema29.properties.publishedAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs6){
if(errors === _errs6){
if(typeof data2 === "string"){
if(!(formats4.validate(data2))){
validate69.errors = [{instancePath:instancePath+"/publishedAt",schemaPath:"#/properties/publishedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
else {
validate69.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate69.errors = vErrors;
return errors === 0;
}
validate69.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const OfficialNewsResponse = validate70;
const schema30 = {"type":"object","additionalProperties":false,"required":["sources"],"properties":{"sources":{"type":"array","minItems":2,"maxItems":2,"items":{"$ref":"#/$defs/OfficialNewsSource"}}}};
const schema31 = {"type":"object","additionalProperties":false,"required":["id","name","homepage","status","syncedAt","expiresAt","items"],"properties":{"id":{"enum":["formula1","fia"]},"name":{"type":"string"},"homepage":{"type":"string","format":"uri"},"status":{"enum":["ready","rights_required","pending","upstream_error"]},"syncedAt":{"type":["string","null"],"format":"date-time"},"expiresAt":{"type":["string","null"],"format":"date-time"},"items":{"type":"array","maxItems":20,"items":{"$ref":"#/$defs/OfficialNewsItem"}}}};

function validate71(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate71.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((data.id === undefined) && (missing0 = "id")) || ((data.name === undefined) && (missing0 = "name"))) || ((data.homepage === undefined) && (missing0 = "homepage"))) || ((data.status === undefined) && (missing0 = "status"))) || ((data.syncedAt === undefined) && (missing0 = "syncedAt"))) || ((data.expiresAt === undefined) && (missing0 = "expiresAt"))) || ((data.items === undefined) && (missing0 = "items"))){
validate71.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((((key0 === "id") || (key0 === "name")) || (key0 === "homepage")) || (key0 === "status")) || (key0 === "syncedAt")) || (key0 === "expiresAt")) || (key0 === "items"))){
validate71.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(!((data0 === "formula1") || (data0 === "fia"))){
validate71.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/enum",keyword:"enum",params:{allowedValues: schema31.properties.id.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.name !== undefined){
const _errs3 = errors;
if(typeof data.name !== "string"){
validate71.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.homepage !== undefined){
let data2 = data.homepage;
const _errs5 = errors;
if(errors === _errs5){
if(errors === _errs5){
if(typeof data2 === "string"){
if(!(formats16(data2))){
validate71.errors = [{instancePath:instancePath+"/homepage",schemaPath:"#/properties/homepage/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""}];
return false;
}
}
else {
validate71.errors = [{instancePath:instancePath+"/homepage",schemaPath:"#/properties/homepage/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.status !== undefined){
let data3 = data.status;
const _errs7 = errors;
if(!((((data3 === "ready") || (data3 === "rights_required")) || (data3 === "pending")) || (data3 === "upstream_error"))){
validate71.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema31.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.syncedAt !== undefined){
let data4 = data.syncedAt;
const _errs8 = errors;
if((typeof data4 !== "string") && (data4 !== null)){
validate71.errors = [{instancePath:instancePath+"/syncedAt",schemaPath:"#/properties/syncedAt/type",keyword:"type",params:{type: schema31.properties.syncedAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs8){
if(errors === _errs8){
if(typeof data4 === "string"){
if(!(formats4.validate(data4))){
validate71.errors = [{instancePath:instancePath+"/syncedAt",schemaPath:"#/properties/syncedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.expiresAt !== undefined){
let data5 = data.expiresAt;
const _errs10 = errors;
if((typeof data5 !== "string") && (data5 !== null)){
validate71.errors = [{instancePath:instancePath+"/expiresAt",schemaPath:"#/properties/expiresAt/type",keyword:"type",params:{type: schema31.properties.expiresAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs10){
if(errors === _errs10){
if(typeof data5 === "string"){
if(!(formats4.validate(data5))){
validate71.errors = [{instancePath:instancePath+"/expiresAt",schemaPath:"#/properties/expiresAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.items !== undefined){
let data6 = data.items;
const _errs12 = errors;
if(errors === _errs12){
if(Array.isArray(data6)){
if(data6.length > 20){
validate71.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/maxItems",keyword:"maxItems",params:{limit: 20},message:"must NOT have more than 20 items"}];
return false;
}
else {
var valid1 = true;
const len0 = data6.length;
for(let i0=0; i0<len0; i0++){
const _errs14 = errors;
if(!(validate69(data6[i0], {instancePath:instancePath+"/items/" + i0,parentData:data6,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate69.errors : vErrors.concat(validate69.errors);
errors = vErrors.length;
}
var valid1 = _errs14 === errors;
if(!valid1){
break;
}
}
}
}
else {
validate71.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
else {
validate71.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate71.errors = vErrors;
return errors === 0;
}
validate71.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate70(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate70.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((data.sources === undefined) && (missing0 = "sources")){
validate70.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(key0 === "sources")){
validate70.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.sources !== undefined){
let data0 = data.sources;
const _errs2 = errors;
if(errors === _errs2){
if(Array.isArray(data0)){
if(data0.length > 2){
validate70.errors = [{instancePath:instancePath+"/sources",schemaPath:"#/properties/sources/maxItems",keyword:"maxItems",params:{limit: 2},message:"must NOT have more than 2 items"}];
return false;
}
else {
if(data0.length < 2){
validate70.errors = [{instancePath:instancePath+"/sources",schemaPath:"#/properties/sources/minItems",keyword:"minItems",params:{limit: 2},message:"must NOT have fewer than 2 items"}];
return false;
}
else {
var valid1 = true;
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
const _errs4 = errors;
if(!(validate71(data0[i0], {instancePath:instancePath+"/sources/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate71.errors : vErrors.concat(validate71.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
}
}
else {
validate70.errors = [{instancePath:instancePath+"/sources",schemaPath:"#/properties/sources/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
}
}
}
}
else {
validate70.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate70.errors = vErrors;
return errors === 0;
}
validate70.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const OfficialNewsSource = validate74;

function validate74(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate74.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((data.id === undefined) && (missing0 = "id")) || ((data.name === undefined) && (missing0 = "name"))) || ((data.homepage === undefined) && (missing0 = "homepage"))) || ((data.status === undefined) && (missing0 = "status"))) || ((data.syncedAt === undefined) && (missing0 = "syncedAt"))) || ((data.expiresAt === undefined) && (missing0 = "expiresAt"))) || ((data.items === undefined) && (missing0 = "items"))){
validate74.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((((key0 === "id") || (key0 === "name")) || (key0 === "homepage")) || (key0 === "status")) || (key0 === "syncedAt")) || (key0 === "expiresAt")) || (key0 === "items"))){
validate74.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(!((data0 === "formula1") || (data0 === "fia"))){
validate74.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/enum",keyword:"enum",params:{allowedValues: schema31.properties.id.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.name !== undefined){
const _errs3 = errors;
if(typeof data.name !== "string"){
validate74.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.homepage !== undefined){
let data2 = data.homepage;
const _errs5 = errors;
if(errors === _errs5){
if(errors === _errs5){
if(typeof data2 === "string"){
if(!(formats16(data2))){
validate74.errors = [{instancePath:instancePath+"/homepage",schemaPath:"#/properties/homepage/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""}];
return false;
}
}
else {
validate74.errors = [{instancePath:instancePath+"/homepage",schemaPath:"#/properties/homepage/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.status !== undefined){
let data3 = data.status;
const _errs7 = errors;
if(!((((data3 === "ready") || (data3 === "rights_required")) || (data3 === "pending")) || (data3 === "upstream_error"))){
validate74.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema31.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.syncedAt !== undefined){
let data4 = data.syncedAt;
const _errs8 = errors;
if((typeof data4 !== "string") && (data4 !== null)){
validate74.errors = [{instancePath:instancePath+"/syncedAt",schemaPath:"#/properties/syncedAt/type",keyword:"type",params:{type: schema31.properties.syncedAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs8){
if(errors === _errs8){
if(typeof data4 === "string"){
if(!(formats4.validate(data4))){
validate74.errors = [{instancePath:instancePath+"/syncedAt",schemaPath:"#/properties/syncedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.expiresAt !== undefined){
let data5 = data.expiresAt;
const _errs10 = errors;
if((typeof data5 !== "string") && (data5 !== null)){
validate74.errors = [{instancePath:instancePath+"/expiresAt",schemaPath:"#/properties/expiresAt/type",keyword:"type",params:{type: schema31.properties.expiresAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs10){
if(errors === _errs10){
if(typeof data5 === "string"){
if(!(formats4.validate(data5))){
validate74.errors = [{instancePath:instancePath+"/expiresAt",schemaPath:"#/properties/expiresAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.items !== undefined){
let data6 = data.items;
const _errs12 = errors;
if(errors === _errs12){
if(Array.isArray(data6)){
if(data6.length > 20){
validate74.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/maxItems",keyword:"maxItems",params:{limit: 20},message:"must NOT have more than 20 items"}];
return false;
}
else {
var valid1 = true;
const len0 = data6.length;
for(let i0=0; i0<len0; i0++){
const _errs14 = errors;
if(!(validate69(data6[i0], {instancePath:instancePath+"/items/" + i0,parentData:data6,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate69.errors : vErrors.concat(validate69.errors);
errors = vErrors.length;
}
var valid1 = _errs14 === errors;
if(!valid1){
break;
}
}
}
}
else {
validate74.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
else {
validate74.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate74.errors = vErrors;
return errors === 0;
}
validate74.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const OpenCatalog = validate76;
const schema33 = {"type":"object","additionalProperties":false,"required":["status","license","licenseUrl","syncedAt","expiresAt","items"],"properties":{"status":{"enum":["ready","pending","upstream_error","disabled"]},"license":{"const":"CC0 1.0"},"licenseUrl":{"const":"https://creativecommons.org/publicdomain/zero/1.0/"},"syncedAt":{"type":["string","null"],"format":"date-time"},"expiresAt":{"type":["string","null"],"format":"date-time"},"items":{"type":"array","maxItems":3,"items":{"$ref":"#/$defs/OpenCatalogEntry"}}}};
const schema34 = {"type":"object","additionalProperties":false,"required":["id","name","nameZh","description","descriptionZh","sourceUrl","sourceUpdatedAt","revision"],"properties":{"id":{"enum":["Q173365","Q9673","Q2239218"]},"name":{"type":"string"},"nameZh":{"type":"string"},"description":{"type":"string"},"descriptionZh":{"type":"string"},"sourceUrl":{"type":"string","format":"uri"},"sourceUpdatedAt":{"type":"string","format":"date-time"},"revision":{"type":"integer","minimum":1}}};

function validate77(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate77.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((((((data.id === undefined) && (missing0 = "id")) || ((data.name === undefined) && (missing0 = "name"))) || ((data.nameZh === undefined) && (missing0 = "nameZh"))) || ((data.description === undefined) && (missing0 = "description"))) || ((data.descriptionZh === undefined) && (missing0 = "descriptionZh"))) || ((data.sourceUrl === undefined) && (missing0 = "sourceUrl"))) || ((data.sourceUpdatedAt === undefined) && (missing0 = "sourceUpdatedAt"))) || ((data.revision === undefined) && (missing0 = "revision"))){
validate77.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((((((key0 === "id") || (key0 === "name")) || (key0 === "nameZh")) || (key0 === "description")) || (key0 === "descriptionZh")) || (key0 === "sourceUrl")) || (key0 === "sourceUpdatedAt")) || (key0 === "revision"))){
validate77.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(!(((data0 === "Q173365") || (data0 === "Q9673")) || (data0 === "Q2239218"))){
validate77.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/enum",keyword:"enum",params:{allowedValues: schema34.properties.id.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.name !== undefined){
const _errs3 = errors;
if(typeof data.name !== "string"){
validate77.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.nameZh !== undefined){
const _errs5 = errors;
if(typeof data.nameZh !== "string"){
validate77.errors = [{instancePath:instancePath+"/nameZh",schemaPath:"#/properties/nameZh/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.description !== undefined){
const _errs7 = errors;
if(typeof data.description !== "string"){
validate77.errors = [{instancePath:instancePath+"/description",schemaPath:"#/properties/description/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.descriptionZh !== undefined){
const _errs9 = errors;
if(typeof data.descriptionZh !== "string"){
validate77.errors = [{instancePath:instancePath+"/descriptionZh",schemaPath:"#/properties/descriptionZh/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.sourceUrl !== undefined){
let data5 = data.sourceUrl;
const _errs11 = errors;
if(errors === _errs11){
if(errors === _errs11){
if(typeof data5 === "string"){
if(!(formats16(data5))){
validate77.errors = [{instancePath:instancePath+"/sourceUrl",schemaPath:"#/properties/sourceUrl/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""}];
return false;
}
}
else {
validate77.errors = [{instancePath:instancePath+"/sourceUrl",schemaPath:"#/properties/sourceUrl/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.sourceUpdatedAt !== undefined){
let data6 = data.sourceUpdatedAt;
const _errs13 = errors;
if(errors === _errs13){
if(errors === _errs13){
if(typeof data6 === "string"){
if(!(formats4.validate(data6))){
validate77.errors = [{instancePath:instancePath+"/sourceUpdatedAt",schemaPath:"#/properties/sourceUpdatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate77.errors = [{instancePath:instancePath+"/sourceUpdatedAt",schemaPath:"#/properties/sourceUpdatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs13 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.revision !== undefined){
let data7 = data.revision;
const _errs15 = errors;
if(!((typeof data7 == "number") && (!(data7 % 1) && !isNaN(data7)))){
validate77.errors = [{instancePath:instancePath+"/revision",schemaPath:"#/properties/revision/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs15){
if(typeof data7 == "number"){
if(data7 < 1 || isNaN(data7)){
validate77.errors = [{instancePath:instancePath+"/revision",schemaPath:"#/properties/revision/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
var valid0 = _errs15 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
else {
validate77.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate77.errors = vErrors;
return errors === 0;
}
validate77.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate76(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate76.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((((data.status === undefined) && (missing0 = "status")) || ((data.license === undefined) && (missing0 = "license"))) || ((data.licenseUrl === undefined) && (missing0 = "licenseUrl"))) || ((data.syncedAt === undefined) && (missing0 = "syncedAt"))) || ((data.expiresAt === undefined) && (missing0 = "expiresAt"))) || ((data.items === undefined) && (missing0 = "items"))){
validate76.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((((key0 === "status") || (key0 === "license")) || (key0 === "licenseUrl")) || (key0 === "syncedAt")) || (key0 === "expiresAt")) || (key0 === "items"))){
validate76.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.status !== undefined){
let data0 = data.status;
const _errs2 = errors;
if(!((((data0 === "ready") || (data0 === "pending")) || (data0 === "upstream_error")) || (data0 === "disabled"))){
validate76.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema33.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.license !== undefined){
const _errs3 = errors;
if("CC0 1.0" !== data.license){
validate76.errors = [{instancePath:instancePath+"/license",schemaPath:"#/properties/license/const",keyword:"const",params:{allowedValue: "CC0 1.0"},message:"must be equal to constant"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.licenseUrl !== undefined){
const _errs4 = errors;
if("https://creativecommons.org/publicdomain/zero/1.0/" !== data.licenseUrl){
validate76.errors = [{instancePath:instancePath+"/licenseUrl",schemaPath:"#/properties/licenseUrl/const",keyword:"const",params:{allowedValue: "https://creativecommons.org/publicdomain/zero/1.0/"},message:"must be equal to constant"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.syncedAt !== undefined){
let data3 = data.syncedAt;
const _errs5 = errors;
if((typeof data3 !== "string") && (data3 !== null)){
validate76.errors = [{instancePath:instancePath+"/syncedAt",schemaPath:"#/properties/syncedAt/type",keyword:"type",params:{type: schema33.properties.syncedAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(errors === _errs5){
if(typeof data3 === "string"){
if(!(formats4.validate(data3))){
validate76.errors = [{instancePath:instancePath+"/syncedAt",schemaPath:"#/properties/syncedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.expiresAt !== undefined){
let data4 = data.expiresAt;
const _errs7 = errors;
if((typeof data4 !== "string") && (data4 !== null)){
validate76.errors = [{instancePath:instancePath+"/expiresAt",schemaPath:"#/properties/expiresAt/type",keyword:"type",params:{type: schema33.properties.expiresAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs7){
if(errors === _errs7){
if(typeof data4 === "string"){
if(!(formats4.validate(data4))){
validate76.errors = [{instancePath:instancePath+"/expiresAt",schemaPath:"#/properties/expiresAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.items !== undefined){
let data5 = data.items;
const _errs9 = errors;
if(errors === _errs9){
if(Array.isArray(data5)){
if(data5.length > 3){
validate76.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/maxItems",keyword:"maxItems",params:{limit: 3},message:"must NOT have more than 3 items"}];
return false;
}
else {
var valid1 = true;
const len0 = data5.length;
for(let i0=0; i0<len0; i0++){
const _errs11 = errors;
if(!(validate77(data5[i0], {instancePath:instancePath+"/items/" + i0,parentData:data5,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
var valid1 = _errs11 === errors;
if(!valid1){
break;
}
}
}
}
else {
validate76.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
else {
validate76.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate76.errors = vErrors;
return errors === 0;
}
validate76.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const OpenCatalogEntry = validate79;

function validate79(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate79.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((((((data.id === undefined) && (missing0 = "id")) || ((data.name === undefined) && (missing0 = "name"))) || ((data.nameZh === undefined) && (missing0 = "nameZh"))) || ((data.description === undefined) && (missing0 = "description"))) || ((data.descriptionZh === undefined) && (missing0 = "descriptionZh"))) || ((data.sourceUrl === undefined) && (missing0 = "sourceUrl"))) || ((data.sourceUpdatedAt === undefined) && (missing0 = "sourceUpdatedAt"))) || ((data.revision === undefined) && (missing0 = "revision"))){
validate79.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((((((key0 === "id") || (key0 === "name")) || (key0 === "nameZh")) || (key0 === "description")) || (key0 === "descriptionZh")) || (key0 === "sourceUrl")) || (key0 === "sourceUpdatedAt")) || (key0 === "revision"))){
validate79.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(!(((data0 === "Q173365") || (data0 === "Q9673")) || (data0 === "Q2239218"))){
validate79.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/enum",keyword:"enum",params:{allowedValues: schema34.properties.id.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.name !== undefined){
const _errs3 = errors;
if(typeof data.name !== "string"){
validate79.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.nameZh !== undefined){
const _errs5 = errors;
if(typeof data.nameZh !== "string"){
validate79.errors = [{instancePath:instancePath+"/nameZh",schemaPath:"#/properties/nameZh/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.description !== undefined){
const _errs7 = errors;
if(typeof data.description !== "string"){
validate79.errors = [{instancePath:instancePath+"/description",schemaPath:"#/properties/description/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.descriptionZh !== undefined){
const _errs9 = errors;
if(typeof data.descriptionZh !== "string"){
validate79.errors = [{instancePath:instancePath+"/descriptionZh",schemaPath:"#/properties/descriptionZh/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.sourceUrl !== undefined){
let data5 = data.sourceUrl;
const _errs11 = errors;
if(errors === _errs11){
if(errors === _errs11){
if(typeof data5 === "string"){
if(!(formats16(data5))){
validate79.errors = [{instancePath:instancePath+"/sourceUrl",schemaPath:"#/properties/sourceUrl/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""}];
return false;
}
}
else {
validate79.errors = [{instancePath:instancePath+"/sourceUrl",schemaPath:"#/properties/sourceUrl/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.sourceUpdatedAt !== undefined){
let data6 = data.sourceUpdatedAt;
const _errs13 = errors;
if(errors === _errs13){
if(errors === _errs13){
if(typeof data6 === "string"){
if(!(formats4.validate(data6))){
validate79.errors = [{instancePath:instancePath+"/sourceUpdatedAt",schemaPath:"#/properties/sourceUpdatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate79.errors = [{instancePath:instancePath+"/sourceUpdatedAt",schemaPath:"#/properties/sourceUpdatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs13 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.revision !== undefined){
let data7 = data.revision;
const _errs15 = errors;
if(!((typeof data7 == "number") && (!(data7 % 1) && !isNaN(data7)))){
validate79.errors = [{instancePath:instancePath+"/revision",schemaPath:"#/properties/revision/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs15){
if(typeof data7 == "number"){
if(data7 < 1 || isNaN(data7)){
validate79.errors = [{instancePath:instancePath+"/revision",schemaPath:"#/properties/revision/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
var valid0 = _errs15 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
else {
validate79.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate79.errors = vErrors;
return errors === 0;
}
validate79.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const Phase2Provenance = validate80;

function validate80(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate80.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((((data.sourceId === undefined) && (missing0 = "sourceId")) || ((data.sourceCode === undefined) && (missing0 = "sourceCode"))) || ((data.mode === undefined) && (missing0 = "mode"))) || ((data.fetchedAt === undefined) && (missing0 = "fetchedAt"))) || ((data.attribution === undefined) && (missing0 = "attribution"))) || ((data.timeZone === undefined) && (missing0 = "timeZone"))){
validate80.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((((key0 === "sourceId") || (key0 === "sourceCode")) || (key0 === "mode")) || (key0 === "fetchedAt")) || (key0 === "attribution")) || (key0 === "timeZone"))){
validate80.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.sourceId !== undefined){
let data0 = data.sourceId;
const _errs2 = errors;
if(errors === _errs2){
if(errors === _errs2){
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
validate80.errors = [{instancePath:instancePath+"/sourceId",schemaPath:"#/properties/sourceId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate80.errors = [{instancePath:instancePath+"/sourceId",schemaPath:"#/properties/sourceId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.sourceCode !== undefined){
const _errs4 = errors;
if(typeof data.sourceCode !== "string"){
validate80.errors = [{instancePath:instancePath+"/sourceCode",schemaPath:"#/properties/sourceCode/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.mode !== undefined){
let data2 = data.mode;
const _errs6 = errors;
if(!((data2 === "mock") || (data2 === "licensed"))){
validate80.errors = [{instancePath:instancePath+"/mode",schemaPath:"#/properties/mode/enum",keyword:"enum",params:{allowedValues: schema21.properties.mode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.fetchedAt !== undefined){
let data3 = data.fetchedAt;
const _errs7 = errors;
if(errors === _errs7){
if(errors === _errs7){
if(typeof data3 === "string"){
if(!(formats4.validate(data3))){
validate80.errors = [{instancePath:instancePath+"/fetchedAt",schemaPath:"#/properties/fetchedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate80.errors = [{instancePath:instancePath+"/fetchedAt",schemaPath:"#/properties/fetchedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.attribution !== undefined){
const _errs9 = errors;
if(typeof data.attribution !== "string"){
validate80.errors = [{instancePath:instancePath+"/attribution",schemaPath:"#/properties/attribution/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.timeZone !== undefined){
const _errs11 = errors;
if(typeof data.timeZone !== "string"){
validate80.errors = [{instancePath:instancePath+"/timeZone",schemaPath:"#/properties/timeZone/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
else {
validate80.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate80.errors = vErrors;
return errors === 0;
}
validate80.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const Problem = validate81;
const schema37 = {"type":"object","additionalProperties":false,"required":["type","title","status","code","traceId"],"properties":{"type":{"type":"string"},"title":{"type":"string"},"status":{"type":"integer"},"code":{"type":"string"},"traceId":{"type":"string"}}};

function validate81(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate81.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((data.type === undefined) && (missing0 = "type")) || ((data.title === undefined) && (missing0 = "title"))) || ((data.status === undefined) && (missing0 = "status"))) || ((data.code === undefined) && (missing0 = "code"))) || ((data.traceId === undefined) && (missing0 = "traceId"))){
validate81.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "type") || (key0 === "title")) || (key0 === "status")) || (key0 === "code")) || (key0 === "traceId"))){
validate81.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.type !== undefined){
const _errs2 = errors;
if(typeof data.type !== "string"){
validate81.errors = [{instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.title !== undefined){
const _errs4 = errors;
if(typeof data.title !== "string"){
validate81.errors = [{instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.status !== undefined){
let data2 = data.status;
const _errs6 = errors;
if(!((typeof data2 == "number") && (!(data2 % 1) && !isNaN(data2)))){
validate81.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.code !== undefined){
const _errs8 = errors;
if(typeof data.code !== "string"){
validate81.errors = [{instancePath:instancePath+"/code",schemaPath:"#/properties/code/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.traceId !== undefined){
const _errs10 = errors;
if(typeof data.traceId !== "string"){
validate81.errors = [{instancePath:instancePath+"/traceId",schemaPath:"#/properties/traceId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
else {
validate81.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate81.errors = vErrors;
return errors === 0;
}
validate81.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const RaceEvent = validate82;
const schema38 = {"type":"object","additionalProperties":false,"required":["id","name","seasonId","circuitId","round","startsAt","status","laps","revision","timeZone","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"name":{"type":"string"},"seasonId":{"type":"string","format":"uuid"},"circuitId":{"type":"string","format":"uuid"},"round":{"type":"integer"},"startsAt":{"type":"string","format":"date-time"},"status":{"enum":["scheduled","completed","cancelled"]},"laps":{"type":["integer","null"]},"revision":{"type":"integer"},"timeZone":{"type":"string"},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};

function validate82(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate82.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((((((((data.id === undefined) && (missing0 = "id")) || ((data.name === undefined) && (missing0 = "name"))) || ((data.seasonId === undefined) && (missing0 = "seasonId"))) || ((data.circuitId === undefined) && (missing0 = "circuitId"))) || ((data.round === undefined) && (missing0 = "round"))) || ((data.startsAt === undefined) && (missing0 = "startsAt"))) || ((data.status === undefined) && (missing0 = "status"))) || ((data.laps === undefined) && (missing0 = "laps"))) || ((data.revision === undefined) && (missing0 = "revision"))) || ((data.timeZone === undefined) && (missing0 = "timeZone"))) || ((data.provenance === undefined) && (missing0 = "provenance"))) || ((data.dataStatus === undefined) && (missing0 = "dataStatus"))) || ((data.updatedAt === undefined) && (missing0 = "updatedAt"))){
validate82.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema38.properties, key0))){
validate82.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(errors === _errs2){
if(errors === _errs2){
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
validate82.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate82.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.name !== undefined){
const _errs4 = errors;
if(typeof data.name !== "string"){
validate82.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.seasonId !== undefined){
let data2 = data.seasonId;
const _errs6 = errors;
if(errors === _errs6){
if(errors === _errs6){
if(typeof data2 === "string"){
if(!(formats0.test(data2))){
validate82.errors = [{instancePath:instancePath+"/seasonId",schemaPath:"#/properties/seasonId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate82.errors = [{instancePath:instancePath+"/seasonId",schemaPath:"#/properties/seasonId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.circuitId !== undefined){
let data3 = data.circuitId;
const _errs8 = errors;
if(errors === _errs8){
if(errors === _errs8){
if(typeof data3 === "string"){
if(!(formats0.test(data3))){
validate82.errors = [{instancePath:instancePath+"/circuitId",schemaPath:"#/properties/circuitId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate82.errors = [{instancePath:instancePath+"/circuitId",schemaPath:"#/properties/circuitId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.round !== undefined){
let data4 = data.round;
const _errs10 = errors;
if(!((typeof data4 == "number") && (!(data4 % 1) && !isNaN(data4)))){
validate82.errors = [{instancePath:instancePath+"/round",schemaPath:"#/properties/round/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.startsAt !== undefined){
let data5 = data.startsAt;
const _errs12 = errors;
if(errors === _errs12){
if(errors === _errs12){
if(typeof data5 === "string"){
if(!(formats4.validate(data5))){
validate82.errors = [{instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate82.errors = [{instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.status !== undefined){
let data6 = data.status;
const _errs14 = errors;
if(!(((data6 === "scheduled") || (data6 === "completed")) || (data6 === "cancelled"))){
validate82.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema38.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs14 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.laps !== undefined){
let data7 = data.laps;
const _errs15 = errors;
if((!((typeof data7 == "number") && (!(data7 % 1) && !isNaN(data7)))) && (data7 !== null)){
validate82.errors = [{instancePath:instancePath+"/laps",schemaPath:"#/properties/laps/type",keyword:"type",params:{type: schema38.properties.laps.type},message:"must be integer,null"}];
return false;
}
var valid0 = _errs15 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.revision !== undefined){
let data8 = data.revision;
const _errs17 = errors;
if(!((typeof data8 == "number") && (!(data8 % 1) && !isNaN(data8)))){
validate82.errors = [{instancePath:instancePath+"/revision",schemaPath:"#/properties/revision/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs17 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.timeZone !== undefined){
const _errs19 = errors;
if(typeof data.timeZone !== "string"){
validate82.errors = [{instancePath:instancePath+"/timeZone",schemaPath:"#/properties/timeZone/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs19 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.provenance !== undefined){
const _errs21 = errors;
if(!(validate54(data.provenance, {instancePath:instancePath+"/provenance",parentData:data,parentDataProperty:"provenance",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
errors = vErrors.length;
}
var valid0 = _errs21 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataStatus !== undefined){
let data11 = data.dataStatus;
const _errs22 = errors;
if(!((((data11 === "synthetic") || (data11 === "current")) || (data11 === "stale")) || (data11 === "corrected"))){
validate82.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema38.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs22 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.updatedAt !== undefined){
let data12 = data.updatedAt;
const _errs23 = errors;
if(errors === _errs23){
if(errors === _errs23){
if(typeof data12 === "string"){
if(!(formats4.validate(data12))){
validate82.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate82.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs23 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate82.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate82.errors = vErrors;
return errors === 0;
}
validate82.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const RaceEventDetailV2 = validate84;
const schema39 = {"type":"object","additionalProperties":false,"required":["data","dataMode"],"properties":{"data":{"$ref":"#/$defs/RaceEvent"},"dataMode":{"enum":["mock","licensed"]}}};

function validate84(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate84.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.data === undefined) && (missing0 = "data")) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate84.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "data") || (key0 === "dataMode"))){
validate84.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.data !== undefined){
const _errs2 = errors;
if(!(validate82(data.data, {instancePath:instancePath+"/data",parentData:data,parentDataProperty:"data",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate82.errors : vErrors.concat(validate82.errors);
errors = vErrors.length;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataMode !== undefined){
let data1 = data.dataMode;
const _errs3 = errors;
if(!((data1 === "mock") || (data1 === "licensed"))){
validate84.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema39.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate84.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate84.errors = vErrors;
return errors === 0;
}
validate84.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const RaceEventPageV2 = validate86;
const schema40 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/RaceEvent"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};

function validate86(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate86.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((data.items === undefined) && (missing0 = "items")) || ((data.nextCursor === undefined) && (missing0 = "nextCursor"))) || ((data.snapshotVersion === undefined) && (missing0 = "snapshotVersion"))) || ((data.snapshotId === undefined) && (missing0 = "snapshotId"))) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate86.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate86.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.items !== undefined){
let data0 = data.items;
const _errs2 = errors;
if(errors === _errs2){
if(Array.isArray(data0)){
var valid1 = true;
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
const _errs4 = errors;
if(!(validate82(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate82.errors : vErrors.concat(validate82.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate86.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.nextCursor !== undefined){
let data2 = data.nextCursor;
const _errs5 = errors;
if((typeof data2 !== "string") && (data2 !== null)){
validate86.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema40.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate86.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
return false;
}
}
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotVersion !== undefined){
let data3 = data.snapshotVersion;
const _errs7 = errors;
if(errors === _errs7){
if(typeof data3 === "string"){
if(!pattern4.test(data3)){
validate86.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate86.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotId !== undefined){
let data4 = data.snapshotId;
const _errs9 = errors;
if((typeof data4 !== "string") && (data4 !== null)){
validate86.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema40.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate86.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataMode !== undefined){
let data5 = data.dataMode;
const _errs11 = errors;
if(!((((data5 === "mock") || (data5 === "licensed")) || (data5 === "mixed")) || (data5 === "empty"))){
validate86.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema40.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
else {
validate86.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate86.errors = vErrors;
return errors === 0;
}
validate86.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const RaceSession = validate88;
const schema41 = {"type":"object","additionalProperties":false,"required":["id","raceId","kind","sequence","startsAt","endsAt","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"raceId":{"type":"string","format":"uuid"},"kind":{"enum":["practice","qualifying","sprint","race"]},"sequence":{"type":"integer"},"startsAt":{"type":"string","format":"date-time"},"endsAt":{"type":["string","null"],"format":"date-time"},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};

function validate88(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate88.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((((data.id === undefined) && (missing0 = "id")) || ((data.raceId === undefined) && (missing0 = "raceId"))) || ((data.kind === undefined) && (missing0 = "kind"))) || ((data.sequence === undefined) && (missing0 = "sequence"))) || ((data.startsAt === undefined) && (missing0 = "startsAt"))) || ((data.endsAt === undefined) && (missing0 = "endsAt"))) || ((data.provenance === undefined) && (missing0 = "provenance"))) || ((data.dataStatus === undefined) && (missing0 = "dataStatus"))) || ((data.updatedAt === undefined) && (missing0 = "updatedAt"))){
validate88.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema41.properties, key0))){
validate88.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(errors === _errs2){
if(errors === _errs2){
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
validate88.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate88.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.raceId !== undefined){
let data1 = data.raceId;
const _errs4 = errors;
if(errors === _errs4){
if(errors === _errs4){
if(typeof data1 === "string"){
if(!(formats0.test(data1))){
validate88.errors = [{instancePath:instancePath+"/raceId",schemaPath:"#/properties/raceId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate88.errors = [{instancePath:instancePath+"/raceId",schemaPath:"#/properties/raceId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.kind !== undefined){
let data2 = data.kind;
const _errs6 = errors;
if(!((((data2 === "practice") || (data2 === "qualifying")) || (data2 === "sprint")) || (data2 === "race"))){
validate88.errors = [{instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/enum",keyword:"enum",params:{allowedValues: schema41.properties.kind.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.sequence !== undefined){
let data3 = data.sequence;
const _errs7 = errors;
if(!((typeof data3 == "number") && (!(data3 % 1) && !isNaN(data3)))){
validate88.errors = [{instancePath:instancePath+"/sequence",schemaPath:"#/properties/sequence/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.startsAt !== undefined){
let data4 = data.startsAt;
const _errs9 = errors;
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats4.validate(data4))){
validate88.errors = [{instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate88.errors = [{instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.endsAt !== undefined){
let data5 = data.endsAt;
const _errs11 = errors;
if((typeof data5 !== "string") && (data5 !== null)){
validate88.errors = [{instancePath:instancePath+"/endsAt",schemaPath:"#/properties/endsAt/type",keyword:"type",params:{type: schema41.properties.endsAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs11){
if(errors === _errs11){
if(typeof data5 === "string"){
if(!(formats4.validate(data5))){
validate88.errors = [{instancePath:instancePath+"/endsAt",schemaPath:"#/properties/endsAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.provenance !== undefined){
const _errs13 = errors;
if(!(validate54(data.provenance, {instancePath:instancePath+"/provenance",parentData:data,parentDataProperty:"provenance",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
errors = vErrors.length;
}
var valid0 = _errs13 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataStatus !== undefined){
let data7 = data.dataStatus;
const _errs14 = errors;
if(!((((data7 === "synthetic") || (data7 === "current")) || (data7 === "stale")) || (data7 === "corrected"))){
validate88.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema41.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs14 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.updatedAt !== undefined){
let data8 = data.updatedAt;
const _errs15 = errors;
if(errors === _errs15){
if(errors === _errs15){
if(typeof data8 === "string"){
if(!(formats4.validate(data8))){
validate88.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate88.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs15 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate88.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate88.errors = vErrors;
return errors === 0;
}
validate88.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const RaceSessionPageV2 = validate90;
const schema42 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/RaceSession"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};

function validate90(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate90.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((data.items === undefined) && (missing0 = "items")) || ((data.nextCursor === undefined) && (missing0 = "nextCursor"))) || ((data.snapshotVersion === undefined) && (missing0 = "snapshotVersion"))) || ((data.snapshotId === undefined) && (missing0 = "snapshotId"))) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate90.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate90.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.items !== undefined){
let data0 = data.items;
const _errs2 = errors;
if(errors === _errs2){
if(Array.isArray(data0)){
var valid1 = true;
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
const _errs4 = errors;
if(!(validate88(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate88.errors : vErrors.concat(validate88.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate90.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.nextCursor !== undefined){
let data2 = data.nextCursor;
const _errs5 = errors;
if((typeof data2 !== "string") && (data2 !== null)){
validate90.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema42.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate90.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
return false;
}
}
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotVersion !== undefined){
let data3 = data.snapshotVersion;
const _errs7 = errors;
if(errors === _errs7){
if(typeof data3 === "string"){
if(!pattern4.test(data3)){
validate90.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate90.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotId !== undefined){
let data4 = data.snapshotId;
const _errs9 = errors;
if((typeof data4 !== "string") && (data4 !== null)){
validate90.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema42.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate90.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataMode !== undefined){
let data5 = data.dataMode;
const _errs11 = errors;
if(!((((data5 === "mock") || (data5 === "licensed")) || (data5 === "mixed")) || (data5 === "empty"))){
validate90.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema42.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
else {
validate90.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate90.errors = vErrors;
return errors === 0;
}
validate90.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const RaceWeekend = validate92;
const schema43 = {"type":"object","additionalProperties":false,"required":["id","name","nameZh","circuit","circuitZh","location","locationZh","startsAt","endsAt","gmtOffset","cancelled","sprint","sessions"],"properties":{"id":{"type":"integer","minimum":1},"name":{"type":"string"},"nameZh":{"type":"string"},"circuit":{"type":"string"},"circuitZh":{"type":"string"},"location":{"type":"string"},"locationZh":{"type":"string"},"startsAt":{"type":"string","format":"date-time"},"endsAt":{"type":"string","format":"date-time"},"gmtOffset":{"type":"string","pattern":"^-?(?:0[0-9]|1[0-4]):[0-5][0-9]:00$"},"cancelled":{"type":"boolean"},"sprint":{"type":"boolean"},"sessions":{"type":"array","maxItems":10,"items":{"$ref":"#/$defs/WeekendSession"}}}};
const pattern8 = new RegExp("^-?(?:0[0-9]|1[0-4]):[0-5][0-9]:00$", "u");
const schema44 = {"type":"object","additionalProperties":false,"required":["id","name","kind","startsAt","endsAt"],"properties":{"id":{"type":"integer","minimum":1},"name":{"type":"string"},"kind":{"enum":["practice1","practice2","practice3","qualifying","sprintQualifying","sprint","race","other"]},"startsAt":{"type":"string","format":"date-time"},"endsAt":{"type":"string","format":"date-time"},"endEstimated":{"type":"boolean"}}};

function validate93(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate93.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((data.id === undefined) && (missing0 = "id")) || ((data.name === undefined) && (missing0 = "name"))) || ((data.kind === undefined) && (missing0 = "kind"))) || ((data.startsAt === undefined) && (missing0 = "startsAt"))) || ((data.endsAt === undefined) && (missing0 = "endsAt"))){
validate93.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((((key0 === "id") || (key0 === "name")) || (key0 === "kind")) || (key0 === "startsAt")) || (key0 === "endsAt")) || (key0 === "endEstimated"))){
validate93.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(!((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0)))){
validate93.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs2){
if(typeof data0 == "number"){
if(data0 < 1 || isNaN(data0)){
validate93.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.name !== undefined){
const _errs4 = errors;
if(typeof data.name !== "string"){
validate93.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.kind !== undefined){
let data2 = data.kind;
const _errs6 = errors;
if(!((((((((data2 === "practice1") || (data2 === "practice2")) || (data2 === "practice3")) || (data2 === "qualifying")) || (data2 === "sprintQualifying")) || (data2 === "sprint")) || (data2 === "race")) || (data2 === "other"))){
validate93.errors = [{instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/enum",keyword:"enum",params:{allowedValues: schema44.properties.kind.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.startsAt !== undefined){
let data3 = data.startsAt;
const _errs7 = errors;
if(errors === _errs7){
if(errors === _errs7){
if(typeof data3 === "string"){
if(!(formats4.validate(data3))){
validate93.errors = [{instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate93.errors = [{instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.endsAt !== undefined){
let data4 = data.endsAt;
const _errs9 = errors;
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats4.validate(data4))){
validate93.errors = [{instancePath:instancePath+"/endsAt",schemaPath:"#/properties/endsAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate93.errors = [{instancePath:instancePath+"/endsAt",schemaPath:"#/properties/endsAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.endEstimated !== undefined){
const _errs11 = errors;
if(typeof data.endEstimated !== "boolean"){
validate93.errors = [{instancePath:instancePath+"/endEstimated",schemaPath:"#/properties/endEstimated/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
else {
validate93.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate93.errors = vErrors;
return errors === 0;
}
validate93.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate92(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate92.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((((((((data.id === undefined) && (missing0 = "id")) || ((data.name === undefined) && (missing0 = "name"))) || ((data.nameZh === undefined) && (missing0 = "nameZh"))) || ((data.circuit === undefined) && (missing0 = "circuit"))) || ((data.circuitZh === undefined) && (missing0 = "circuitZh"))) || ((data.location === undefined) && (missing0 = "location"))) || ((data.locationZh === undefined) && (missing0 = "locationZh"))) || ((data.startsAt === undefined) && (missing0 = "startsAt"))) || ((data.endsAt === undefined) && (missing0 = "endsAt"))) || ((data.gmtOffset === undefined) && (missing0 = "gmtOffset"))) || ((data.cancelled === undefined) && (missing0 = "cancelled"))) || ((data.sprint === undefined) && (missing0 = "sprint"))) || ((data.sessions === undefined) && (missing0 = "sessions"))){
validate92.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema43.properties, key0))){
validate92.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(!((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0)))){
validate92.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs2){
if(typeof data0 == "number"){
if(data0 < 1 || isNaN(data0)){
validate92.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.name !== undefined){
const _errs4 = errors;
if(typeof data.name !== "string"){
validate92.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.nameZh !== undefined){
const _errs6 = errors;
if(typeof data.nameZh !== "string"){
validate92.errors = [{instancePath:instancePath+"/nameZh",schemaPath:"#/properties/nameZh/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.circuit !== undefined){
const _errs8 = errors;
if(typeof data.circuit !== "string"){
validate92.errors = [{instancePath:instancePath+"/circuit",schemaPath:"#/properties/circuit/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.circuitZh !== undefined){
const _errs10 = errors;
if(typeof data.circuitZh !== "string"){
validate92.errors = [{instancePath:instancePath+"/circuitZh",schemaPath:"#/properties/circuitZh/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.location !== undefined){
const _errs12 = errors;
if(typeof data.location !== "string"){
validate92.errors = [{instancePath:instancePath+"/location",schemaPath:"#/properties/location/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.locationZh !== undefined){
const _errs14 = errors;
if(typeof data.locationZh !== "string"){
validate92.errors = [{instancePath:instancePath+"/locationZh",schemaPath:"#/properties/locationZh/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs14 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.startsAt !== undefined){
let data7 = data.startsAt;
const _errs16 = errors;
if(errors === _errs16){
if(errors === _errs16){
if(typeof data7 === "string"){
if(!(formats4.validate(data7))){
validate92.errors = [{instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate92.errors = [{instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs16 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.endsAt !== undefined){
let data8 = data.endsAt;
const _errs18 = errors;
if(errors === _errs18){
if(errors === _errs18){
if(typeof data8 === "string"){
if(!(formats4.validate(data8))){
validate92.errors = [{instancePath:instancePath+"/endsAt",schemaPath:"#/properties/endsAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate92.errors = [{instancePath:instancePath+"/endsAt",schemaPath:"#/properties/endsAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs18 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.gmtOffset !== undefined){
let data9 = data.gmtOffset;
const _errs20 = errors;
if(errors === _errs20){
if(typeof data9 === "string"){
if(!pattern8.test(data9)){
validate92.errors = [{instancePath:instancePath+"/gmtOffset",schemaPath:"#/properties/gmtOffset/pattern",keyword:"pattern",params:{pattern: "^-?(?:0[0-9]|1[0-4]):[0-5][0-9]:00$"},message:"must match pattern \""+"^-?(?:0[0-9]|1[0-4]):[0-5][0-9]:00$"+"\""}];
return false;
}
}
else {
validate92.errors = [{instancePath:instancePath+"/gmtOffset",schemaPath:"#/properties/gmtOffset/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs20 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.cancelled !== undefined){
const _errs22 = errors;
if(typeof data.cancelled !== "boolean"){
validate92.errors = [{instancePath:instancePath+"/cancelled",schemaPath:"#/properties/cancelled/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid0 = _errs22 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.sprint !== undefined){
const _errs24 = errors;
if(typeof data.sprint !== "boolean"){
validate92.errors = [{instancePath:instancePath+"/sprint",schemaPath:"#/properties/sprint/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid0 = _errs24 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.sessions !== undefined){
let data12 = data.sessions;
const _errs26 = errors;
if(errors === _errs26){
if(Array.isArray(data12)){
if(data12.length > 10){
validate92.errors = [{instancePath:instancePath+"/sessions",schemaPath:"#/properties/sessions/maxItems",keyword:"maxItems",params:{limit: 10},message:"must NOT have more than 10 items"}];
return false;
}
else {
var valid1 = true;
const len0 = data12.length;
for(let i0=0; i0<len0; i0++){
const _errs28 = errors;
if(!(validate93(data12[i0], {instancePath:instancePath+"/sessions/" + i0,parentData:data12,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate93.errors : vErrors.concat(validate93.errors);
errors = vErrors.length;
}
var valid1 = _errs28 === errors;
if(!valid1){
break;
}
}
}
}
else {
validate92.errors = [{instancePath:instancePath+"/sessions",schemaPath:"#/properties/sessions/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs26 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate92.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate92.errors = vErrors;
return errors === 0;
}
validate92.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const Readiness = validate95;
const schema45 = {"type":"object","additionalProperties":false,"required":["status","phase","dataMode","database","cache"],"properties":{"status":{"enum":["ready","degraded","unavailable"]},"phase":{"const":"2"},"dataMode":{"const":"mock"},"database":{"enum":["up","down"]},"cache":{"enum":["up","down","disabled"]}}};

function validate95(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate95.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((data.status === undefined) && (missing0 = "status")) || ((data.phase === undefined) && (missing0 = "phase"))) || ((data.dataMode === undefined) && (missing0 = "dataMode"))) || ((data.database === undefined) && (missing0 = "database"))) || ((data.cache === undefined) && (missing0 = "cache"))){
validate95.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "status") || (key0 === "phase")) || (key0 === "dataMode")) || (key0 === "database")) || (key0 === "cache"))){
validate95.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.status !== undefined){
let data0 = data.status;
const _errs2 = errors;
if(!(((data0 === "ready") || (data0 === "degraded")) || (data0 === "unavailable"))){
validate95.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema45.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.phase !== undefined){
const _errs3 = errors;
if("2" !== data.phase){
validate95.errors = [{instancePath:instancePath+"/phase",schemaPath:"#/properties/phase/const",keyword:"const",params:{allowedValue: "2"},message:"must be equal to constant"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataMode !== undefined){
const _errs4 = errors;
if("mock" !== data.dataMode){
validate95.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/const",keyword:"const",params:{allowedValue: "mock"},message:"must be equal to constant"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.database !== undefined){
let data3 = data.database;
const _errs5 = errors;
if(!((data3 === "up") || (data3 === "down"))){
validate95.errors = [{instancePath:instancePath+"/database",schemaPath:"#/properties/database/enum",keyword:"enum",params:{allowedValues: schema45.properties.database.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.cache !== undefined){
let data4 = data.cache;
const _errs6 = errors;
if(!(((data4 === "up") || (data4 === "down")) || (data4 === "disabled"))){
validate95.errors = [{instancePath:instancePath+"/cache",schemaPath:"#/properties/cache/enum",keyword:"enum",params:{allowedValues: schema45.properties.cache.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
else {
validate95.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate95.errors = vErrors;
return errors === 0;
}
validate95.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const Season = validate96;
const schema46 = {"type":"object","additionalProperties":false,"required":["id","year","seriesCode","seriesName","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"year":{"type":"integer"},"seriesCode":{"type":"string"},"seriesName":{"type":"string"},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};

function validate96(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate96.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((data.id === undefined) && (missing0 = "id")) || ((data.year === undefined) && (missing0 = "year"))) || ((data.seriesCode === undefined) && (missing0 = "seriesCode"))) || ((data.seriesName === undefined) && (missing0 = "seriesName"))) || ((data.provenance === undefined) && (missing0 = "provenance"))) || ((data.dataStatus === undefined) && (missing0 = "dataStatus"))) || ((data.updatedAt === undefined) && (missing0 = "updatedAt"))){
validate96.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((((key0 === "id") || (key0 === "year")) || (key0 === "seriesCode")) || (key0 === "seriesName")) || (key0 === "provenance")) || (key0 === "dataStatus")) || (key0 === "updatedAt"))){
validate96.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(errors === _errs2){
if(errors === _errs2){
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
validate96.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate96.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.year !== undefined){
let data1 = data.year;
const _errs4 = errors;
if(!((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1)))){
validate96.errors = [{instancePath:instancePath+"/year",schemaPath:"#/properties/year/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.seriesCode !== undefined){
const _errs6 = errors;
if(typeof data.seriesCode !== "string"){
validate96.errors = [{instancePath:instancePath+"/seriesCode",schemaPath:"#/properties/seriesCode/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.seriesName !== undefined){
const _errs8 = errors;
if(typeof data.seriesName !== "string"){
validate96.errors = [{instancePath:instancePath+"/seriesName",schemaPath:"#/properties/seriesName/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.provenance !== undefined){
const _errs10 = errors;
if(!(validate54(data.provenance, {instancePath:instancePath+"/provenance",parentData:data,parentDataProperty:"provenance",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
errors = vErrors.length;
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataStatus !== undefined){
let data5 = data.dataStatus;
const _errs11 = errors;
if(!((((data5 === "synthetic") || (data5 === "current")) || (data5 === "stale")) || (data5 === "corrected"))){
validate96.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema46.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.updatedAt !== undefined){
let data6 = data.updatedAt;
const _errs12 = errors;
if(errors === _errs12){
if(errors === _errs12){
if(typeof data6 === "string"){
if(!(formats4.validate(data6))){
validate96.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate96.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
else {
validate96.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate96.errors = vErrors;
return errors === 0;
}
validate96.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const SeasonDetailV2 = validate98;
const schema47 = {"type":"object","additionalProperties":false,"required":["data","dataMode"],"properties":{"data":{"$ref":"#/$defs/Season"},"dataMode":{"enum":["mock","licensed"]}}};

function validate98(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate98.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.data === undefined) && (missing0 = "data")) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate98.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "data") || (key0 === "dataMode"))){
validate98.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.data !== undefined){
const _errs2 = errors;
if(!(validate96(data.data, {instancePath:instancePath+"/data",parentData:data,parentDataProperty:"data",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate96.errors : vErrors.concat(validate96.errors);
errors = vErrors.length;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataMode !== undefined){
let data1 = data.dataMode;
const _errs3 = errors;
if(!((data1 === "mock") || (data1 === "licensed"))){
validate98.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema47.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate98.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate98.errors = vErrors;
return errors === 0;
}
validate98.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const SeasonEntry = validate100;
const schema48 = {"type":"object","additionalProperties":false,"required":["id","seasonId","driverId","teamId","carNumber","fromRound","toRound","driverName","teamName","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"seasonId":{"type":"string","format":"uuid"},"driverId":{"type":"string","format":"uuid"},"teamId":{"type":"string","format":"uuid"},"carNumber":{"type":["integer","null"]},"fromRound":{"type":"integer"},"toRound":{"type":["integer","null"]},"driverName":{"type":"string"},"teamName":{"type":"string"},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};

function validate100(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate100.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((((((((((data.id === undefined) && (missing0 = "id")) || ((data.seasonId === undefined) && (missing0 = "seasonId"))) || ((data.driverId === undefined) && (missing0 = "driverId"))) || ((data.teamId === undefined) && (missing0 = "teamId"))) || ((data.carNumber === undefined) && (missing0 = "carNumber"))) || ((data.fromRound === undefined) && (missing0 = "fromRound"))) || ((data.toRound === undefined) && (missing0 = "toRound"))) || ((data.driverName === undefined) && (missing0 = "driverName"))) || ((data.teamName === undefined) && (missing0 = "teamName"))) || ((data.provenance === undefined) && (missing0 = "provenance"))) || ((data.dataStatus === undefined) && (missing0 = "dataStatus"))) || ((data.updatedAt === undefined) && (missing0 = "updatedAt"))){
validate100.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema48.properties, key0))){
validate100.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(errors === _errs2){
if(errors === _errs2){
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
validate100.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate100.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.seasonId !== undefined){
let data1 = data.seasonId;
const _errs4 = errors;
if(errors === _errs4){
if(errors === _errs4){
if(typeof data1 === "string"){
if(!(formats0.test(data1))){
validate100.errors = [{instancePath:instancePath+"/seasonId",schemaPath:"#/properties/seasonId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate100.errors = [{instancePath:instancePath+"/seasonId",schemaPath:"#/properties/seasonId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.driverId !== undefined){
let data2 = data.driverId;
const _errs6 = errors;
if(errors === _errs6){
if(errors === _errs6){
if(typeof data2 === "string"){
if(!(formats0.test(data2))){
validate100.errors = [{instancePath:instancePath+"/driverId",schemaPath:"#/properties/driverId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate100.errors = [{instancePath:instancePath+"/driverId",schemaPath:"#/properties/driverId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.teamId !== undefined){
let data3 = data.teamId;
const _errs8 = errors;
if(errors === _errs8){
if(errors === _errs8){
if(typeof data3 === "string"){
if(!(formats0.test(data3))){
validate100.errors = [{instancePath:instancePath+"/teamId",schemaPath:"#/properties/teamId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate100.errors = [{instancePath:instancePath+"/teamId",schemaPath:"#/properties/teamId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.carNumber !== undefined){
let data4 = data.carNumber;
const _errs10 = errors;
if((!((typeof data4 == "number") && (!(data4 % 1) && !isNaN(data4)))) && (data4 !== null)){
validate100.errors = [{instancePath:instancePath+"/carNumber",schemaPath:"#/properties/carNumber/type",keyword:"type",params:{type: schema48.properties.carNumber.type},message:"must be integer,null"}];
return false;
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.fromRound !== undefined){
let data5 = data.fromRound;
const _errs12 = errors;
if(!((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5)))){
validate100.errors = [{instancePath:instancePath+"/fromRound",schemaPath:"#/properties/fromRound/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.toRound !== undefined){
let data6 = data.toRound;
const _errs14 = errors;
if((!((typeof data6 == "number") && (!(data6 % 1) && !isNaN(data6)))) && (data6 !== null)){
validate100.errors = [{instancePath:instancePath+"/toRound",schemaPath:"#/properties/toRound/type",keyword:"type",params:{type: schema48.properties.toRound.type},message:"must be integer,null"}];
return false;
}
var valid0 = _errs14 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.driverName !== undefined){
const _errs16 = errors;
if(typeof data.driverName !== "string"){
validate100.errors = [{instancePath:instancePath+"/driverName",schemaPath:"#/properties/driverName/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs16 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.teamName !== undefined){
const _errs18 = errors;
if(typeof data.teamName !== "string"){
validate100.errors = [{instancePath:instancePath+"/teamName",schemaPath:"#/properties/teamName/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs18 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.provenance !== undefined){
const _errs20 = errors;
if(!(validate54(data.provenance, {instancePath:instancePath+"/provenance",parentData:data,parentDataProperty:"provenance",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
errors = vErrors.length;
}
var valid0 = _errs20 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataStatus !== undefined){
let data10 = data.dataStatus;
const _errs21 = errors;
if(!((((data10 === "synthetic") || (data10 === "current")) || (data10 === "stale")) || (data10 === "corrected"))){
validate100.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema48.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs21 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.updatedAt !== undefined){
let data11 = data.updatedAt;
const _errs22 = errors;
if(errors === _errs22){
if(errors === _errs22){
if(typeof data11 === "string"){
if(!(formats4.validate(data11))){
validate100.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate100.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs22 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate100.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate100.errors = vErrors;
return errors === 0;
}
validate100.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const SeasonEntryPageV2 = validate102;
const schema49 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/SeasonEntry"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};

function validate102(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate102.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((data.items === undefined) && (missing0 = "items")) || ((data.nextCursor === undefined) && (missing0 = "nextCursor"))) || ((data.snapshotVersion === undefined) && (missing0 = "snapshotVersion"))) || ((data.snapshotId === undefined) && (missing0 = "snapshotId"))) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate102.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate102.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.items !== undefined){
let data0 = data.items;
const _errs2 = errors;
if(errors === _errs2){
if(Array.isArray(data0)){
var valid1 = true;
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
const _errs4 = errors;
if(!(validate100(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate100.errors : vErrors.concat(validate100.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate102.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.nextCursor !== undefined){
let data2 = data.nextCursor;
const _errs5 = errors;
if((typeof data2 !== "string") && (data2 !== null)){
validate102.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema49.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate102.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
return false;
}
}
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotVersion !== undefined){
let data3 = data.snapshotVersion;
const _errs7 = errors;
if(errors === _errs7){
if(typeof data3 === "string"){
if(!pattern4.test(data3)){
validate102.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate102.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotId !== undefined){
let data4 = data.snapshotId;
const _errs9 = errors;
if((typeof data4 !== "string") && (data4 !== null)){
validate102.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema49.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate102.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataMode !== undefined){
let data5 = data.dataMode;
const _errs11 = errors;
if(!((((data5 === "mock") || (data5 === "licensed")) || (data5 === "mixed")) || (data5 === "empty"))){
validate102.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema49.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
else {
validate102.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate102.errors = vErrors;
return errors === 0;
}
validate102.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const SeasonInsightEntry = validate104;
const schema50 = {"type":"object","additionalProperties":false,"required":["id","name","team","color","position","positionStart","points","pointsStart"],"properties":{"id":{"type":"string","minLength":1,"maxLength":200},"name":{"type":"string","minLength":1,"maxLength":200},"team":{"type":"string","maxLength":200},"color":{"type":"string","pattern":"^[A-F0-9]{6}$"},"position":{"type":"integer","minimum":1,"maximum":40},"positionStart":{"type":["integer","null"],"minimum":1,"maximum":40},"points":{"type":"string","pattern":"^[0-9]+(?:\\.[0-9]{1,3})?$"},"pointsStart":{"type":"string","pattern":"^[0-9]+(?:\\.[0-9]{1,3})?$"}}};
const pattern10 = new RegExp("^[A-F0-9]{6}$", "u");
const pattern11 = new RegExp("^[0-9]+(?:\\.[0-9]{1,3})?$", "u");

function validate104(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate104.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((((((data.id === undefined) && (missing0 = "id")) || ((data.name === undefined) && (missing0 = "name"))) || ((data.team === undefined) && (missing0 = "team"))) || ((data.color === undefined) && (missing0 = "color"))) || ((data.position === undefined) && (missing0 = "position"))) || ((data.positionStart === undefined) && (missing0 = "positionStart"))) || ((data.points === undefined) && (missing0 = "points"))) || ((data.pointsStart === undefined) && (missing0 = "pointsStart"))){
validate104.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((((((key0 === "id") || (key0 === "name")) || (key0 === "team")) || (key0 === "color")) || (key0 === "position")) || (key0 === "positionStart")) || (key0 === "points")) || (key0 === "pointsStart"))){
validate104.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(errors === _errs2){
if(typeof data0 === "string"){
if(func2(data0) > 200){
validate104.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/maxLength",keyword:"maxLength",params:{limit: 200},message:"must NOT have more than 200 characters"}];
return false;
}
else {
if(func2(data0) < 1){
validate104.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
}
}
else {
validate104.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.name !== undefined){
let data1 = data.name;
const _errs4 = errors;
if(errors === _errs4){
if(typeof data1 === "string"){
if(func2(data1) > 200){
validate104.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/maxLength",keyword:"maxLength",params:{limit: 200},message:"must NOT have more than 200 characters"}];
return false;
}
else {
if(func2(data1) < 1){
validate104.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
}
}
else {
validate104.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.team !== undefined){
let data2 = data.team;
const _errs6 = errors;
if(errors === _errs6){
if(typeof data2 === "string"){
if(func2(data2) > 200){
validate104.errors = [{instancePath:instancePath+"/team",schemaPath:"#/properties/team/maxLength",keyword:"maxLength",params:{limit: 200},message:"must NOT have more than 200 characters"}];
return false;
}
}
else {
validate104.errors = [{instancePath:instancePath+"/team",schemaPath:"#/properties/team/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.color !== undefined){
let data3 = data.color;
const _errs8 = errors;
if(errors === _errs8){
if(typeof data3 === "string"){
if(!pattern10.test(data3)){
validate104.errors = [{instancePath:instancePath+"/color",schemaPath:"#/properties/color/pattern",keyword:"pattern",params:{pattern: "^[A-F0-9]{6}$"},message:"must match pattern \""+"^[A-F0-9]{6}$"+"\""}];
return false;
}
}
else {
validate104.errors = [{instancePath:instancePath+"/color",schemaPath:"#/properties/color/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.position !== undefined){
let data4 = data.position;
const _errs10 = errors;
if(!((typeof data4 == "number") && (!(data4 % 1) && !isNaN(data4)))){
validate104.errors = [{instancePath:instancePath+"/position",schemaPath:"#/properties/position/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs10){
if(typeof data4 == "number"){
if(data4 > 40 || isNaN(data4)){
validate104.errors = [{instancePath:instancePath+"/position",schemaPath:"#/properties/position/maximum",keyword:"maximum",params:{comparison: "<=", limit: 40},message:"must be <= 40"}];
return false;
}
else {
if(data4 < 1 || isNaN(data4)){
validate104.errors = [{instancePath:instancePath+"/position",schemaPath:"#/properties/position/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.positionStart !== undefined){
let data5 = data.positionStart;
const _errs12 = errors;
if((!((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5)))) && (data5 !== null)){
validate104.errors = [{instancePath:instancePath+"/positionStart",schemaPath:"#/properties/positionStart/type",keyword:"type",params:{type: schema50.properties.positionStart.type},message:"must be integer,null"}];
return false;
}
if(errors === _errs12){
if(typeof data5 == "number"){
if(data5 > 40 || isNaN(data5)){
validate104.errors = [{instancePath:instancePath+"/positionStart",schemaPath:"#/properties/positionStart/maximum",keyword:"maximum",params:{comparison: "<=", limit: 40},message:"must be <= 40"}];
return false;
}
else {
if(data5 < 1 || isNaN(data5)){
validate104.errors = [{instancePath:instancePath+"/positionStart",schemaPath:"#/properties/positionStart/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.points !== undefined){
let data6 = data.points;
const _errs14 = errors;
if(errors === _errs14){
if(typeof data6 === "string"){
if(!pattern11.test(data6)){
validate104.errors = [{instancePath:instancePath+"/points",schemaPath:"#/properties/points/pattern",keyword:"pattern",params:{pattern: "^[0-9]+(?:\\.[0-9]{1,3})?$"},message:"must match pattern \""+"^[0-9]+(?:\\.[0-9]{1,3})?$"+"\""}];
return false;
}
}
else {
validate104.errors = [{instancePath:instancePath+"/points",schemaPath:"#/properties/points/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs14 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.pointsStart !== undefined){
let data7 = data.pointsStart;
const _errs16 = errors;
if(errors === _errs16){
if(typeof data7 === "string"){
if(!pattern11.test(data7)){
validate104.errors = [{instancePath:instancePath+"/pointsStart",schemaPath:"#/properties/pointsStart/pattern",keyword:"pattern",params:{pattern: "^[0-9]+(?:\\.[0-9]{1,3})?$"},message:"must match pattern \""+"^[0-9]+(?:\\.[0-9]{1,3})?$"+"\""}];
return false;
}
}
else {
validate104.errors = [{instancePath:instancePath+"/pointsStart",schemaPath:"#/properties/pointsStart/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs16 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
else {
validate104.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate104.errors = vErrors;
return errors === 0;
}
validate104.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const SeasonInsightRound = validate105;
const schema51 = {"type":"object","additionalProperties":false,"required":["id","meetingId","circuit","circuitZh","endsAt","drivers","teams"],"properties":{"id":{"type":"integer","minimum":1},"meetingId":{"type":"integer","minimum":1},"circuit":{"type":"string","minLength":1,"maxLength":200},"circuitZh":{"type":"string","maxLength":200},"endsAt":{"type":"string","format":"date-time"},"drivers":{"type":"array","minItems":1,"maxItems":40,"items":{"$ref":"#/$defs/SeasonInsightEntry"}},"teams":{"type":"array","minItems":1,"maxItems":40,"items":{"$ref":"#/$defs/SeasonInsightEntry"}}}};

function validate105(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate105.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((data.id === undefined) && (missing0 = "id")) || ((data.meetingId === undefined) && (missing0 = "meetingId"))) || ((data.circuit === undefined) && (missing0 = "circuit"))) || ((data.circuitZh === undefined) && (missing0 = "circuitZh"))) || ((data.endsAt === undefined) && (missing0 = "endsAt"))) || ((data.drivers === undefined) && (missing0 = "drivers"))) || ((data.teams === undefined) && (missing0 = "teams"))){
validate105.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((((key0 === "id") || (key0 === "meetingId")) || (key0 === "circuit")) || (key0 === "circuitZh")) || (key0 === "endsAt")) || (key0 === "drivers")) || (key0 === "teams"))){
validate105.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(!((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0)))){
validate105.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs2){
if(typeof data0 == "number"){
if(data0 < 1 || isNaN(data0)){
validate105.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.meetingId !== undefined){
let data1 = data.meetingId;
const _errs4 = errors;
if(!((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1)))){
validate105.errors = [{instancePath:instancePath+"/meetingId",schemaPath:"#/properties/meetingId/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs4){
if(typeof data1 == "number"){
if(data1 < 1 || isNaN(data1)){
validate105.errors = [{instancePath:instancePath+"/meetingId",schemaPath:"#/properties/meetingId/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.circuit !== undefined){
let data2 = data.circuit;
const _errs6 = errors;
if(errors === _errs6){
if(typeof data2 === "string"){
if(func2(data2) > 200){
validate105.errors = [{instancePath:instancePath+"/circuit",schemaPath:"#/properties/circuit/maxLength",keyword:"maxLength",params:{limit: 200},message:"must NOT have more than 200 characters"}];
return false;
}
else {
if(func2(data2) < 1){
validate105.errors = [{instancePath:instancePath+"/circuit",schemaPath:"#/properties/circuit/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
}
}
else {
validate105.errors = [{instancePath:instancePath+"/circuit",schemaPath:"#/properties/circuit/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.circuitZh !== undefined){
let data3 = data.circuitZh;
const _errs8 = errors;
if(errors === _errs8){
if(typeof data3 === "string"){
if(func2(data3) > 200){
validate105.errors = [{instancePath:instancePath+"/circuitZh",schemaPath:"#/properties/circuitZh/maxLength",keyword:"maxLength",params:{limit: 200},message:"must NOT have more than 200 characters"}];
return false;
}
}
else {
validate105.errors = [{instancePath:instancePath+"/circuitZh",schemaPath:"#/properties/circuitZh/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.endsAt !== undefined){
let data4 = data.endsAt;
const _errs10 = errors;
if(errors === _errs10){
if(errors === _errs10){
if(typeof data4 === "string"){
if(!(formats4.validate(data4))){
validate105.errors = [{instancePath:instancePath+"/endsAt",schemaPath:"#/properties/endsAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate105.errors = [{instancePath:instancePath+"/endsAt",schemaPath:"#/properties/endsAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.drivers !== undefined){
let data5 = data.drivers;
const _errs12 = errors;
if(errors === _errs12){
if(Array.isArray(data5)){
if(data5.length > 40){
validate105.errors = [{instancePath:instancePath+"/drivers",schemaPath:"#/properties/drivers/maxItems",keyword:"maxItems",params:{limit: 40},message:"must NOT have more than 40 items"}];
return false;
}
else {
if(data5.length < 1){
validate105.errors = [{instancePath:instancePath+"/drivers",schemaPath:"#/properties/drivers/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"}];
return false;
}
else {
var valid1 = true;
const len0 = data5.length;
for(let i0=0; i0<len0; i0++){
const _errs14 = errors;
if(!(validate104(data5[i0], {instancePath:instancePath+"/drivers/" + i0,parentData:data5,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate104.errors : vErrors.concat(validate104.errors);
errors = vErrors.length;
}
var valid1 = _errs14 === errors;
if(!valid1){
break;
}
}
}
}
}
else {
validate105.errors = [{instancePath:instancePath+"/drivers",schemaPath:"#/properties/drivers/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.teams !== undefined){
let data7 = data.teams;
const _errs15 = errors;
if(errors === _errs15){
if(Array.isArray(data7)){
if(data7.length > 40){
validate105.errors = [{instancePath:instancePath+"/teams",schemaPath:"#/properties/teams/maxItems",keyword:"maxItems",params:{limit: 40},message:"must NOT have more than 40 items"}];
return false;
}
else {
if(data7.length < 1){
validate105.errors = [{instancePath:instancePath+"/teams",schemaPath:"#/properties/teams/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"}];
return false;
}
else {
var valid2 = true;
const len1 = data7.length;
for(let i1=0; i1<len1; i1++){
const _errs17 = errors;
if(!(validate104(data7[i1], {instancePath:instancePath+"/teams/" + i1,parentData:data7,parentDataProperty:i1,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate104.errors : vErrors.concat(validate104.errors);
errors = vErrors.length;
}
var valid2 = _errs17 === errors;
if(!valid2){
break;
}
}
}
}
}
else {
validate105.errors = [{instancePath:instancePath+"/teams",schemaPath:"#/properties/teams/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs15 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
else {
validate105.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate105.errors = vErrors;
return errors === 0;
}
validate105.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const SeasonInsightsResponse = validate108;
const schema52 = {"type":"object","additionalProperties":false,"required":["status","year","source","sourceUrl","license","licenseUrl","syncedAt","expiresAt","rounds"],"properties":{"status":{"enum":["ready","empty","pending","upstream_error","disabled"]},"year":{"const":2026},"source":{"enum":["OpenF1","F1DB"]},"sourceUrl":{"enum":["https://openf1.org/","https://github.com/f1db/f1db"]},"license":{"enum":["CC BY-NC-SA 4.0","CC BY 4.0"]},"licenseUrl":{"enum":["https://creativecommons.org/licenses/by-nc-sa/4.0/","https://creativecommons.org/licenses/by/4.0/"]},"syncedAt":{"type":["string","null"],"format":"date-time"},"expiresAt":{"type":["string","null"],"format":"date-time"},"rounds":{"type":"array","maxItems":30,"items":{"$ref":"#/$defs/SeasonInsightRound"}}}};

function validate108(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate108.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((((data.status === undefined) && (missing0 = "status")) || ((data.year === undefined) && (missing0 = "year"))) || ((data.source === undefined) && (missing0 = "source"))) || ((data.sourceUrl === undefined) && (missing0 = "sourceUrl"))) || ((data.license === undefined) && (missing0 = "license"))) || ((data.licenseUrl === undefined) && (missing0 = "licenseUrl"))) || ((data.syncedAt === undefined) && (missing0 = "syncedAt"))) || ((data.expiresAt === undefined) && (missing0 = "expiresAt"))) || ((data.rounds === undefined) && (missing0 = "rounds"))){
validate108.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema52.properties, key0))){
validate108.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.status !== undefined){
let data0 = data.status;
const _errs2 = errors;
if(!(((((data0 === "ready") || (data0 === "empty")) || (data0 === "pending")) || (data0 === "upstream_error")) || (data0 === "disabled"))){
validate108.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema52.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.year !== undefined){
const _errs3 = errors;
if(2026 !== data.year){
validate108.errors = [{instancePath:instancePath+"/year",schemaPath:"#/properties/year/const",keyword:"const",params:{allowedValue: 2026},message:"must be equal to constant"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.source !== undefined){
let data2 = data.source;
const _errs4 = errors;
if(!((data2 === "OpenF1") || (data2 === "F1DB"))){
validate108.errors = [{instancePath:instancePath+"/source",schemaPath:"#/properties/source/enum",keyword:"enum",params:{allowedValues: schema52.properties.source.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.sourceUrl !== undefined){
let data3 = data.sourceUrl;
const _errs5 = errors;
if(!((data3 === "https://openf1.org/") || (data3 === "https://github.com/f1db/f1db"))){
validate108.errors = [{instancePath:instancePath+"/sourceUrl",schemaPath:"#/properties/sourceUrl/enum",keyword:"enum",params:{allowedValues: schema52.properties.sourceUrl.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.license !== undefined){
let data4 = data.license;
const _errs6 = errors;
if(!((data4 === "CC BY-NC-SA 4.0") || (data4 === "CC BY 4.0"))){
validate108.errors = [{instancePath:instancePath+"/license",schemaPath:"#/properties/license/enum",keyword:"enum",params:{allowedValues: schema52.properties.license.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.licenseUrl !== undefined){
let data5 = data.licenseUrl;
const _errs7 = errors;
if(!((data5 === "https://creativecommons.org/licenses/by-nc-sa/4.0/") || (data5 === "https://creativecommons.org/licenses/by/4.0/"))){
validate108.errors = [{instancePath:instancePath+"/licenseUrl",schemaPath:"#/properties/licenseUrl/enum",keyword:"enum",params:{allowedValues: schema52.properties.licenseUrl.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.syncedAt !== undefined){
let data6 = data.syncedAt;
const _errs8 = errors;
if((typeof data6 !== "string") && (data6 !== null)){
validate108.errors = [{instancePath:instancePath+"/syncedAt",schemaPath:"#/properties/syncedAt/type",keyword:"type",params:{type: schema52.properties.syncedAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs8){
if(errors === _errs8){
if(typeof data6 === "string"){
if(!(formats4.validate(data6))){
validate108.errors = [{instancePath:instancePath+"/syncedAt",schemaPath:"#/properties/syncedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.expiresAt !== undefined){
let data7 = data.expiresAt;
const _errs10 = errors;
if((typeof data7 !== "string") && (data7 !== null)){
validate108.errors = [{instancePath:instancePath+"/expiresAt",schemaPath:"#/properties/expiresAt/type",keyword:"type",params:{type: schema52.properties.expiresAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs10){
if(errors === _errs10){
if(typeof data7 === "string"){
if(!(formats4.validate(data7))){
validate108.errors = [{instancePath:instancePath+"/expiresAt",schemaPath:"#/properties/expiresAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.rounds !== undefined){
let data8 = data.rounds;
const _errs12 = errors;
if(errors === _errs12){
if(Array.isArray(data8)){
if(data8.length > 30){
validate108.errors = [{instancePath:instancePath+"/rounds",schemaPath:"#/properties/rounds/maxItems",keyword:"maxItems",params:{limit: 30},message:"must NOT have more than 30 items"}];
return false;
}
else {
var valid1 = true;
const len0 = data8.length;
for(let i0=0; i0<len0; i0++){
const _errs14 = errors;
if(!(validate105(data8[i0], {instancePath:instancePath+"/rounds/" + i0,parentData:data8,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate105.errors : vErrors.concat(validate105.errors);
errors = vErrors.length;
}
var valid1 = _errs14 === errors;
if(!valid1){
break;
}
}
}
}
else {
validate108.errors = [{instancePath:instancePath+"/rounds",schemaPath:"#/properties/rounds/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate108.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate108.errors = vErrors;
return errors === 0;
}
validate108.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const SeasonPageV2 = validate110;
const schema53 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/Season"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};

function validate110(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate110.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((data.items === undefined) && (missing0 = "items")) || ((data.nextCursor === undefined) && (missing0 = "nextCursor"))) || ((data.snapshotVersion === undefined) && (missing0 = "snapshotVersion"))) || ((data.snapshotId === undefined) && (missing0 = "snapshotId"))) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate110.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate110.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.items !== undefined){
let data0 = data.items;
const _errs2 = errors;
if(errors === _errs2){
if(Array.isArray(data0)){
var valid1 = true;
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
const _errs4 = errors;
if(!(validate96(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate96.errors : vErrors.concat(validate96.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate110.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.nextCursor !== undefined){
let data2 = data.nextCursor;
const _errs5 = errors;
if((typeof data2 !== "string") && (data2 !== null)){
validate110.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema53.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate110.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
return false;
}
}
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotVersion !== undefined){
let data3 = data.snapshotVersion;
const _errs7 = errors;
if(errors === _errs7){
if(typeof data3 === "string"){
if(!pattern4.test(data3)){
validate110.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate110.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotId !== undefined){
let data4 = data.snapshotId;
const _errs9 = errors;
if((typeof data4 !== "string") && (data4 !== null)){
validate110.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema53.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate110.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataMode !== undefined){
let data5 = data.dataMode;
const _errs11 = errors;
if(!((((data5 === "mock") || (data5 === "licensed")) || (data5 === "mixed")) || (data5 === "empty"))){
validate110.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema53.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
else {
validate110.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate110.errors = vErrors;
return errors === 0;
}
validate110.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const SessionResult = validate112;
const schema54 = {"type":"object","additionalProperties":false,"required":["id","sessionId","raceId","driverId","teamId","driverName","teamName","position","resultStatus","points","elapsedMs","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"sessionId":{"type":"string","format":"uuid"},"raceId":{"type":"string","format":"uuid"},"driverId":{"type":"string","format":"uuid"},"teamId":{"type":"string","format":"uuid"},"driverName":{"type":"string"},"teamName":{"type":"string"},"position":{"type":["integer","null"]},"resultStatus":{"enum":["classified","dnf","dns","dsq"]},"points":{"type":"string","pattern":"^-?[0-9]+(?:\\.[0-9]{1,3})?$"},"elapsedMs":{"type":["integer","null"]},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};

function validate112(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate112.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((((((((((((data.id === undefined) && (missing0 = "id")) || ((data.sessionId === undefined) && (missing0 = "sessionId"))) || ((data.raceId === undefined) && (missing0 = "raceId"))) || ((data.driverId === undefined) && (missing0 = "driverId"))) || ((data.teamId === undefined) && (missing0 = "teamId"))) || ((data.driverName === undefined) && (missing0 = "driverName"))) || ((data.teamName === undefined) && (missing0 = "teamName"))) || ((data.position === undefined) && (missing0 = "position"))) || ((data.resultStatus === undefined) && (missing0 = "resultStatus"))) || ((data.points === undefined) && (missing0 = "points"))) || ((data.elapsedMs === undefined) && (missing0 = "elapsedMs"))) || ((data.provenance === undefined) && (missing0 = "provenance"))) || ((data.dataStatus === undefined) && (missing0 = "dataStatus"))) || ((data.updatedAt === undefined) && (missing0 = "updatedAt"))){
validate112.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema54.properties, key0))){
validate112.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(errors === _errs2){
if(errors === _errs2){
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
validate112.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate112.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.sessionId !== undefined){
let data1 = data.sessionId;
const _errs4 = errors;
if(errors === _errs4){
if(errors === _errs4){
if(typeof data1 === "string"){
if(!(formats0.test(data1))){
validate112.errors = [{instancePath:instancePath+"/sessionId",schemaPath:"#/properties/sessionId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate112.errors = [{instancePath:instancePath+"/sessionId",schemaPath:"#/properties/sessionId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.raceId !== undefined){
let data2 = data.raceId;
const _errs6 = errors;
if(errors === _errs6){
if(errors === _errs6){
if(typeof data2 === "string"){
if(!(formats0.test(data2))){
validate112.errors = [{instancePath:instancePath+"/raceId",schemaPath:"#/properties/raceId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate112.errors = [{instancePath:instancePath+"/raceId",schemaPath:"#/properties/raceId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.driverId !== undefined){
let data3 = data.driverId;
const _errs8 = errors;
if(errors === _errs8){
if(errors === _errs8){
if(typeof data3 === "string"){
if(!(formats0.test(data3))){
validate112.errors = [{instancePath:instancePath+"/driverId",schemaPath:"#/properties/driverId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate112.errors = [{instancePath:instancePath+"/driverId",schemaPath:"#/properties/driverId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.teamId !== undefined){
let data4 = data.teamId;
const _errs10 = errors;
if(errors === _errs10){
if(errors === _errs10){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate112.errors = [{instancePath:instancePath+"/teamId",schemaPath:"#/properties/teamId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate112.errors = [{instancePath:instancePath+"/teamId",schemaPath:"#/properties/teamId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.driverName !== undefined){
const _errs12 = errors;
if(typeof data.driverName !== "string"){
validate112.errors = [{instancePath:instancePath+"/driverName",schemaPath:"#/properties/driverName/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.teamName !== undefined){
const _errs14 = errors;
if(typeof data.teamName !== "string"){
validate112.errors = [{instancePath:instancePath+"/teamName",schemaPath:"#/properties/teamName/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs14 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.position !== undefined){
let data7 = data.position;
const _errs16 = errors;
if((!((typeof data7 == "number") && (!(data7 % 1) && !isNaN(data7)))) && (data7 !== null)){
validate112.errors = [{instancePath:instancePath+"/position",schemaPath:"#/properties/position/type",keyword:"type",params:{type: schema54.properties.position.type},message:"must be integer,null"}];
return false;
}
var valid0 = _errs16 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.resultStatus !== undefined){
let data8 = data.resultStatus;
const _errs18 = errors;
if(!((((data8 === "classified") || (data8 === "dnf")) || (data8 === "dns")) || (data8 === "dsq"))){
validate112.errors = [{instancePath:instancePath+"/resultStatus",schemaPath:"#/properties/resultStatus/enum",keyword:"enum",params:{allowedValues: schema54.properties.resultStatus.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs18 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.points !== undefined){
let data9 = data.points;
const _errs19 = errors;
if(errors === _errs19){
if(typeof data9 === "string"){
if(!pattern3.test(data9)){
validate112.errors = [{instancePath:instancePath+"/points",schemaPath:"#/properties/points/pattern",keyword:"pattern",params:{pattern: "^-?[0-9]+(?:\\.[0-9]{1,3})?$"},message:"must match pattern \""+"^-?[0-9]+(?:\\.[0-9]{1,3})?$"+"\""}];
return false;
}
}
else {
validate112.errors = [{instancePath:instancePath+"/points",schemaPath:"#/properties/points/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs19 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.elapsedMs !== undefined){
let data10 = data.elapsedMs;
const _errs21 = errors;
if((!((typeof data10 == "number") && (!(data10 % 1) && !isNaN(data10)))) && (data10 !== null)){
validate112.errors = [{instancePath:instancePath+"/elapsedMs",schemaPath:"#/properties/elapsedMs/type",keyword:"type",params:{type: schema54.properties.elapsedMs.type},message:"must be integer,null"}];
return false;
}
var valid0 = _errs21 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.provenance !== undefined){
const _errs23 = errors;
if(!(validate54(data.provenance, {instancePath:instancePath+"/provenance",parentData:data,parentDataProperty:"provenance",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
errors = vErrors.length;
}
var valid0 = _errs23 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataStatus !== undefined){
let data12 = data.dataStatus;
const _errs24 = errors;
if(!((((data12 === "synthetic") || (data12 === "current")) || (data12 === "stale")) || (data12 === "corrected"))){
validate112.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema54.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs24 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.updatedAt !== undefined){
let data13 = data.updatedAt;
const _errs25 = errors;
if(errors === _errs25){
if(errors === _errs25){
if(typeof data13 === "string"){
if(!(formats4.validate(data13))){
validate112.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate112.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs25 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate112.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate112.errors = vErrors;
return errors === 0;
}
validate112.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const SessionResultPageV2 = validate114;
const schema55 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/SessionResult"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};

function validate114(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate114.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((data.items === undefined) && (missing0 = "items")) || ((data.nextCursor === undefined) && (missing0 = "nextCursor"))) || ((data.snapshotVersion === undefined) && (missing0 = "snapshotVersion"))) || ((data.snapshotId === undefined) && (missing0 = "snapshotId"))) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate114.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate114.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.items !== undefined){
let data0 = data.items;
const _errs2 = errors;
if(errors === _errs2){
if(Array.isArray(data0)){
var valid1 = true;
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
const _errs4 = errors;
if(!(validate112(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate112.errors : vErrors.concat(validate112.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate114.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.nextCursor !== undefined){
let data2 = data.nextCursor;
const _errs5 = errors;
if((typeof data2 !== "string") && (data2 !== null)){
validate114.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema55.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate114.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
return false;
}
}
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotVersion !== undefined){
let data3 = data.snapshotVersion;
const _errs7 = errors;
if(errors === _errs7){
if(typeof data3 === "string"){
if(!pattern4.test(data3)){
validate114.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate114.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotId !== undefined){
let data4 = data.snapshotId;
const _errs9 = errors;
if((typeof data4 !== "string") && (data4 !== null)){
validate114.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema55.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate114.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataMode !== undefined){
let data5 = data.dataMode;
const _errs11 = errors;
if(!((((data5 === "mock") || (data5 === "licensed")) || (data5 === "mixed")) || (data5 === "empty"))){
validate114.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema55.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
else {
validate114.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate114.errors = vErrors;
return errors === 0;
}
validate114.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const StandingRow = validate116;
const schema56 = {"type":"object","additionalProperties":false,"required":["id","snapshotId","seasonId","afterRaceId","capturedAt","snapshotRevision","position","points","wins","name","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"snapshotId":{"type":"string","format":"uuid"},"seasonId":{"type":"string","format":"uuid"},"afterRaceId":{"type":["string","null"],"format":"uuid"},"capturedAt":{"type":"string","format":"date-time"},"snapshotRevision":{"type":"integer"},"position":{"type":"integer"},"points":{"type":"string","pattern":"^-?[0-9]+(?:\\.[0-9]{1,3})?$"},"wins":{"type":"integer"},"name":{"type":"string"},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};

function validate116(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate116.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((((((((data.id === undefined) && (missing0 = "id")) || ((data.snapshotId === undefined) && (missing0 = "snapshotId"))) || ((data.seasonId === undefined) && (missing0 = "seasonId"))) || ((data.afterRaceId === undefined) && (missing0 = "afterRaceId"))) || ((data.capturedAt === undefined) && (missing0 = "capturedAt"))) || ((data.snapshotRevision === undefined) && (missing0 = "snapshotRevision"))) || ((data.position === undefined) && (missing0 = "position"))) || ((data.points === undefined) && (missing0 = "points"))) || ((data.wins === undefined) && (missing0 = "wins"))) || ((data.name === undefined) && (missing0 = "name"))) || ((data.provenance === undefined) && (missing0 = "provenance"))) || ((data.dataStatus === undefined) && (missing0 = "dataStatus"))) || ((data.updatedAt === undefined) && (missing0 = "updatedAt"))){
validate116.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema56.properties, key0))){
validate116.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(errors === _errs2){
if(errors === _errs2){
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
validate116.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate116.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotId !== undefined){
let data1 = data.snapshotId;
const _errs4 = errors;
if(errors === _errs4){
if(errors === _errs4){
if(typeof data1 === "string"){
if(!(formats0.test(data1))){
validate116.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate116.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.seasonId !== undefined){
let data2 = data.seasonId;
const _errs6 = errors;
if(errors === _errs6){
if(errors === _errs6){
if(typeof data2 === "string"){
if(!(formats0.test(data2))){
validate116.errors = [{instancePath:instancePath+"/seasonId",schemaPath:"#/properties/seasonId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate116.errors = [{instancePath:instancePath+"/seasonId",schemaPath:"#/properties/seasonId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.afterRaceId !== undefined){
let data3 = data.afterRaceId;
const _errs8 = errors;
if((typeof data3 !== "string") && (data3 !== null)){
validate116.errors = [{instancePath:instancePath+"/afterRaceId",schemaPath:"#/properties/afterRaceId/type",keyword:"type",params:{type: schema56.properties.afterRaceId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs8){
if(errors === _errs8){
if(typeof data3 === "string"){
if(!(formats0.test(data3))){
validate116.errors = [{instancePath:instancePath+"/afterRaceId",schemaPath:"#/properties/afterRaceId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
}
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.capturedAt !== undefined){
let data4 = data.capturedAt;
const _errs10 = errors;
if(errors === _errs10){
if(errors === _errs10){
if(typeof data4 === "string"){
if(!(formats4.validate(data4))){
validate116.errors = [{instancePath:instancePath+"/capturedAt",schemaPath:"#/properties/capturedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate116.errors = [{instancePath:instancePath+"/capturedAt",schemaPath:"#/properties/capturedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotRevision !== undefined){
let data5 = data.snapshotRevision;
const _errs12 = errors;
if(!((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5)))){
validate116.errors = [{instancePath:instancePath+"/snapshotRevision",schemaPath:"#/properties/snapshotRevision/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.position !== undefined){
let data6 = data.position;
const _errs14 = errors;
if(!((typeof data6 == "number") && (!(data6 % 1) && !isNaN(data6)))){
validate116.errors = [{instancePath:instancePath+"/position",schemaPath:"#/properties/position/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs14 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.points !== undefined){
let data7 = data.points;
const _errs16 = errors;
if(errors === _errs16){
if(typeof data7 === "string"){
if(!pattern3.test(data7)){
validate116.errors = [{instancePath:instancePath+"/points",schemaPath:"#/properties/points/pattern",keyword:"pattern",params:{pattern: "^-?[0-9]+(?:\\.[0-9]{1,3})?$"},message:"must match pattern \""+"^-?[0-9]+(?:\\.[0-9]{1,3})?$"+"\""}];
return false;
}
}
else {
validate116.errors = [{instancePath:instancePath+"/points",schemaPath:"#/properties/points/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs16 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.wins !== undefined){
let data8 = data.wins;
const _errs18 = errors;
if(!((typeof data8 == "number") && (!(data8 % 1) && !isNaN(data8)))){
validate116.errors = [{instancePath:instancePath+"/wins",schemaPath:"#/properties/wins/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
var valid0 = _errs18 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.name !== undefined){
const _errs20 = errors;
if(typeof data.name !== "string"){
validate116.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs20 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.provenance !== undefined){
const _errs22 = errors;
if(!(validate54(data.provenance, {instancePath:instancePath+"/provenance",parentData:data,parentDataProperty:"provenance",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
errors = vErrors.length;
}
var valid0 = _errs22 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataStatus !== undefined){
let data11 = data.dataStatus;
const _errs23 = errors;
if(!((((data11 === "synthetic") || (data11 === "current")) || (data11 === "stale")) || (data11 === "corrected"))){
validate116.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema56.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs23 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.updatedAt !== undefined){
let data12 = data.updatedAt;
const _errs24 = errors;
if(errors === _errs24){
if(errors === _errs24){
if(typeof data12 === "string"){
if(!(formats4.validate(data12))){
validate116.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate116.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs24 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate116.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate116.errors = vErrors;
return errors === 0;
}
validate116.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const StandingRowPageV2 = validate118;
const schema57 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/StandingRow"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};

function validate118(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate118.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((data.items === undefined) && (missing0 = "items")) || ((data.nextCursor === undefined) && (missing0 = "nextCursor"))) || ((data.snapshotVersion === undefined) && (missing0 = "snapshotVersion"))) || ((data.snapshotId === undefined) && (missing0 = "snapshotId"))) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate118.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate118.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.items !== undefined){
let data0 = data.items;
const _errs2 = errors;
if(errors === _errs2){
if(Array.isArray(data0)){
var valid1 = true;
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
const _errs4 = errors;
if(!(validate116(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate116.errors : vErrors.concat(validate116.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate118.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.nextCursor !== undefined){
let data2 = data.nextCursor;
const _errs5 = errors;
if((typeof data2 !== "string") && (data2 !== null)){
validate118.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema57.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate118.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
return false;
}
}
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotVersion !== undefined){
let data3 = data.snapshotVersion;
const _errs7 = errors;
if(errors === _errs7){
if(typeof data3 === "string"){
if(!pattern4.test(data3)){
validate118.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate118.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotId !== undefined){
let data4 = data.snapshotId;
const _errs9 = errors;
if((typeof data4 !== "string") && (data4 !== null)){
validate118.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema57.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate118.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataMode !== undefined){
let data5 = data.dataMode;
const _errs11 = errors;
if(!((((data5 === "mock") || (data5 === "licensed")) || (data5 === "mixed")) || (data5 === "empty"))){
validate118.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema57.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
else {
validate118.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate118.errors = vErrors;
return errors === 0;
}
validate118.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const Team = validate120;
const schema58 = {"type":"object","additionalProperties":false,"required":["id","name","countryCode","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"name":{"type":"string"},"countryCode":{"type":["string","null"]},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};

function validate120(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate120.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((((data.id === undefined) && (missing0 = "id")) || ((data.name === undefined) && (missing0 = "name"))) || ((data.countryCode === undefined) && (missing0 = "countryCode"))) || ((data.provenance === undefined) && (missing0 = "provenance"))) || ((data.dataStatus === undefined) && (missing0 = "dataStatus"))) || ((data.updatedAt === undefined) && (missing0 = "updatedAt"))){
validate120.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((((key0 === "id") || (key0 === "name")) || (key0 === "countryCode")) || (key0 === "provenance")) || (key0 === "dataStatus")) || (key0 === "updatedAt"))){
validate120.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(errors === _errs2){
if(errors === _errs2){
if(typeof data0 === "string"){
if(!(formats0.test(data0))){
validate120.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate120.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.name !== undefined){
const _errs4 = errors;
if(typeof data.name !== "string"){
validate120.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.countryCode !== undefined){
let data2 = data.countryCode;
const _errs6 = errors;
if((typeof data2 !== "string") && (data2 !== null)){
validate120.errors = [{instancePath:instancePath+"/countryCode",schemaPath:"#/properties/countryCode/type",keyword:"type",params:{type: schema58.properties.countryCode.type},message:"must be string,null"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.provenance !== undefined){
const _errs8 = errors;
if(!(validate54(data.provenance, {instancePath:instancePath+"/provenance",parentData:data,parentDataProperty:"provenance",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
errors = vErrors.length;
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataStatus !== undefined){
let data4 = data.dataStatus;
const _errs9 = errors;
if(!((((data4 === "synthetic") || (data4 === "current")) || (data4 === "stale")) || (data4 === "corrected"))){
validate120.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema58.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.updatedAt !== undefined){
let data5 = data.updatedAt;
const _errs10 = errors;
if(errors === _errs10){
if(errors === _errs10){
if(typeof data5 === "string"){
if(!(formats4.validate(data5))){
validate120.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate120.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
else {
validate120.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate120.errors = vErrors;
return errors === 0;
}
validate120.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const TeamDetailV2 = validate122;
const schema59 = {"type":"object","additionalProperties":false,"required":["data","dataMode"],"properties":{"data":{"$ref":"#/$defs/Team"},"dataMode":{"enum":["mock","licensed"]}}};

function validate122(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate122.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.data === undefined) && (missing0 = "data")) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate122.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "data") || (key0 === "dataMode"))){
validate122.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.data !== undefined){
const _errs2 = errors;
if(!(validate120(data.data, {instancePath:instancePath+"/data",parentData:data,parentDataProperty:"data",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate120.errors : vErrors.concat(validate120.errors);
errors = vErrors.length;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataMode !== undefined){
let data1 = data.dataMode;
const _errs3 = errors;
if(!((data1 === "mock") || (data1 === "licensed"))){
validate122.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema59.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate122.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate122.errors = vErrors;
return errors === 0;
}
validate122.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const TeamPageV2 = validate124;
const schema60 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/Team"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};

function validate124(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate124.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((data.items === undefined) && (missing0 = "items")) || ((data.nextCursor === undefined) && (missing0 = "nextCursor"))) || ((data.snapshotVersion === undefined) && (missing0 = "snapshotVersion"))) || ((data.snapshotId === undefined) && (missing0 = "snapshotId"))) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate124.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate124.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.items !== undefined){
let data0 = data.items;
const _errs2 = errors;
if(errors === _errs2){
if(Array.isArray(data0)){
var valid1 = true;
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
const _errs4 = errors;
if(!(validate120(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate120.errors : vErrors.concat(validate120.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate124.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.nextCursor !== undefined){
let data2 = data.nextCursor;
const _errs5 = errors;
if((typeof data2 !== "string") && (data2 !== null)){
validate124.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema60.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate124.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
return false;
}
}
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotVersion !== undefined){
let data3 = data.snapshotVersion;
const _errs7 = errors;
if(errors === _errs7){
if(typeof data3 === "string"){
if(!pattern4.test(data3)){
validate124.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate124.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.snapshotId !== undefined){
let data4 = data.snapshotId;
const _errs9 = errors;
if((typeof data4 !== "string") && (data4 !== null)){
validate124.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema60.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate124.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.dataMode !== undefined){
let data5 = data.dataMode;
const _errs11 = errors;
if(!((((data5 === "mock") || (data5 === "licensed")) || (data5 === "mixed")) || (data5 === "empty"))){
validate124.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema60.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
else {
validate124.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate124.errors = vErrors;
return errors === 0;
}
validate124.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const WeekendSession = validate126;

function validate126(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate126.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((data.id === undefined) && (missing0 = "id")) || ((data.name === undefined) && (missing0 = "name"))) || ((data.kind === undefined) && (missing0 = "kind"))) || ((data.startsAt === undefined) && (missing0 = "startsAt"))) || ((data.endsAt === undefined) && (missing0 = "endsAt"))){
validate126.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((((key0 === "id") || (key0 === "name")) || (key0 === "kind")) || (key0 === "startsAt")) || (key0 === "endsAt")) || (key0 === "endEstimated"))){
validate126.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.id !== undefined){
let data0 = data.id;
const _errs2 = errors;
if(!((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0)))){
validate126.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs2){
if(typeof data0 == "number"){
if(data0 < 1 || isNaN(data0)){
validate126.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.name !== undefined){
const _errs4 = errors;
if(typeof data.name !== "string"){
validate126.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.kind !== undefined){
let data2 = data.kind;
const _errs6 = errors;
if(!((((((((data2 === "practice1") || (data2 === "practice2")) || (data2 === "practice3")) || (data2 === "qualifying")) || (data2 === "sprintQualifying")) || (data2 === "sprint")) || (data2 === "race")) || (data2 === "other"))){
validate126.errors = [{instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/enum",keyword:"enum",params:{allowedValues: schema44.properties.kind.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.startsAt !== undefined){
let data3 = data.startsAt;
const _errs7 = errors;
if(errors === _errs7){
if(errors === _errs7){
if(typeof data3 === "string"){
if(!(formats4.validate(data3))){
validate126.errors = [{instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate126.errors = [{instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.endsAt !== undefined){
let data4 = data.endsAt;
const _errs9 = errors;
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats4.validate(data4))){
validate126.errors = [{instancePath:instancePath+"/endsAt",schemaPath:"#/properties/endsAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate126.errors = [{instancePath:instancePath+"/endsAt",schemaPath:"#/properties/endsAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
}
var valid0 = _errs9 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.endEstimated !== undefined){
const _errs11 = errors;
if(typeof data.endEstimated !== "boolean"){
validate126.errors = [{instancePath:instancePath+"/endEstimated",schemaPath:"#/properties/endEstimated/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"}];
return false;
}
var valid0 = _errs11 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
else {
validate126.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate126.errors = vErrors;
return errors === 0;
}
validate126.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const WeekendsResponse = validate127;
const schema62 = {"type":"object","additionalProperties":false,"required":["status","year","source","sourceUrl","license","licenseUrl","syncedAt","expiresAt","items"],"properties":{"status":{"enum":["ready","pending","upstream_error","disabled"]},"year":{"const":2026},"source":{"enum":["OpenF1","F1DB"]},"sourceUrl":{"enum":["https://openf1.org/","https://github.com/f1db/f1db"]},"license":{"enum":["CC BY-NC-SA 4.0","CC BY 4.0"]},"licenseUrl":{"enum":["https://creativecommons.org/licenses/by-nc-sa/4.0/","https://creativecommons.org/licenses/by/4.0/"]},"syncedAt":{"type":["string","null"],"format":"date-time"},"expiresAt":{"type":["string","null"],"format":"date-time"},"items":{"type":"array","maxItems":30,"items":{"$ref":"#/$defs/RaceWeekend"}}}};

function validate127(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate127.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((((((data.status === undefined) && (missing0 = "status")) || ((data.year === undefined) && (missing0 = "year"))) || ((data.source === undefined) && (missing0 = "source"))) || ((data.sourceUrl === undefined) && (missing0 = "sourceUrl"))) || ((data.license === undefined) && (missing0 = "license"))) || ((data.licenseUrl === undefined) && (missing0 = "licenseUrl"))) || ((data.syncedAt === undefined) && (missing0 = "syncedAt"))) || ((data.expiresAt === undefined) && (missing0 = "expiresAt"))) || ((data.items === undefined) && (missing0 = "items"))){
validate127.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema62.properties, key0))){
validate127.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.status !== undefined){
let data0 = data.status;
const _errs2 = errors;
if(!((((data0 === "ready") || (data0 === "pending")) || (data0 === "upstream_error")) || (data0 === "disabled"))){
validate127.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema62.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.year !== undefined){
const _errs3 = errors;
if(2026 !== data.year){
validate127.errors = [{instancePath:instancePath+"/year",schemaPath:"#/properties/year/const",keyword:"const",params:{allowedValue: 2026},message:"must be equal to constant"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.source !== undefined){
let data2 = data.source;
const _errs4 = errors;
if(!((data2 === "OpenF1") || (data2 === "F1DB"))){
validate127.errors = [{instancePath:instancePath+"/source",schemaPath:"#/properties/source/enum",keyword:"enum",params:{allowedValues: schema62.properties.source.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.sourceUrl !== undefined){
let data3 = data.sourceUrl;
const _errs5 = errors;
if(!((data3 === "https://openf1.org/") || (data3 === "https://github.com/f1db/f1db"))){
validate127.errors = [{instancePath:instancePath+"/sourceUrl",schemaPath:"#/properties/sourceUrl/enum",keyword:"enum",params:{allowedValues: schema62.properties.sourceUrl.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.license !== undefined){
let data4 = data.license;
const _errs6 = errors;
if(!((data4 === "CC BY-NC-SA 4.0") || (data4 === "CC BY 4.0"))){
validate127.errors = [{instancePath:instancePath+"/license",schemaPath:"#/properties/license/enum",keyword:"enum",params:{allowedValues: schema62.properties.license.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.licenseUrl !== undefined){
let data5 = data.licenseUrl;
const _errs7 = errors;
if(!((data5 === "https://creativecommons.org/licenses/by-nc-sa/4.0/") || (data5 === "https://creativecommons.org/licenses/by/4.0/"))){
validate127.errors = [{instancePath:instancePath+"/licenseUrl",schemaPath:"#/properties/licenseUrl/enum",keyword:"enum",params:{allowedValues: schema62.properties.licenseUrl.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.syncedAt !== undefined){
let data6 = data.syncedAt;
const _errs8 = errors;
if((typeof data6 !== "string") && (data6 !== null)){
validate127.errors = [{instancePath:instancePath+"/syncedAt",schemaPath:"#/properties/syncedAt/type",keyword:"type",params:{type: schema62.properties.syncedAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs8){
if(errors === _errs8){
if(typeof data6 === "string"){
if(!(formats4.validate(data6))){
validate127.errors = [{instancePath:instancePath+"/syncedAt",schemaPath:"#/properties/syncedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.expiresAt !== undefined){
let data7 = data.expiresAt;
const _errs10 = errors;
if((typeof data7 !== "string") && (data7 !== null)){
validate127.errors = [{instancePath:instancePath+"/expiresAt",schemaPath:"#/properties/expiresAt/type",keyword:"type",params:{type: schema62.properties.expiresAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs10){
if(errors === _errs10){
if(typeof data7 === "string"){
if(!(formats4.validate(data7))){
validate127.errors = [{instancePath:instancePath+"/expiresAt",schemaPath:"#/properties/expiresAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
}
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.items !== undefined){
let data8 = data.items;
const _errs12 = errors;
if(errors === _errs12){
if(Array.isArray(data8)){
if(data8.length > 30){
validate127.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/maxItems",keyword:"maxItems",params:{limit: 30},message:"must NOT have more than 30 items"}];
return false;
}
else {
var valid1 = true;
const len0 = data8.length;
for(let i0=0; i0<len0; i0++){
const _errs14 = errors;
if(!(validate92(data8[i0], {instancePath:instancePath+"/items/" + i0,parentData:data8,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate92.errors : vErrors.concat(validate92.errors);
errors = vErrors.length;
}
var valid1 = _errs14 === errors;
if(!valid1){
break;
}
}
}
}
else {
validate127.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
return false;
}
}
var valid0 = _errs12 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
}
}
}
else {
validate127.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate127.errors = vErrors;
return errors === 0;
}
validate127.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};
