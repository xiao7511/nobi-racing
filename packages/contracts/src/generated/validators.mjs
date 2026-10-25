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

export const Phase2Provenance = validate66;

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
if(((((((data.sourceId === undefined) && (missing0 = "sourceId")) || ((data.sourceCode === undefined) && (missing0 = "sourceCode"))) || ((data.mode === undefined) && (missing0 = "mode"))) || ((data.fetchedAt === undefined) && (missing0 = "fetchedAt"))) || ((data.attribution === undefined) && (missing0 = "attribution"))) || ((data.timeZone === undefined) && (missing0 = "timeZone"))){
validate66.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((((key0 === "sourceId") || (key0 === "sourceCode")) || (key0 === "mode")) || (key0 === "fetchedAt")) || (key0 === "attribution")) || (key0 === "timeZone"))){
validate66.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
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
validate66.errors = [{instancePath:instancePath+"/sourceId",schemaPath:"#/properties/sourceId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate66.errors = [{instancePath:instancePath+"/sourceId",schemaPath:"#/properties/sourceId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate66.errors = [{instancePath:instancePath+"/sourceCode",schemaPath:"#/properties/sourceCode/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate66.errors = [{instancePath:instancePath+"/mode",schemaPath:"#/properties/mode/enum",keyword:"enum",params:{allowedValues: schema21.properties.mode.enum},message:"must be equal to one of the allowed values"}];
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
validate66.errors = [{instancePath:instancePath+"/fetchedAt",schemaPath:"#/properties/fetchedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate66.errors = [{instancePath:instancePath+"/fetchedAt",schemaPath:"#/properties/fetchedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate66.errors = [{instancePath:instancePath+"/attribution",schemaPath:"#/properties/attribution/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate66.errors = [{instancePath:instancePath+"/timeZone",schemaPath:"#/properties/timeZone/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate66.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate66.errors = vErrors;
return errors === 0;
}
validate66.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const Problem = validate67;
const schema28 = {"type":"object","additionalProperties":false,"required":["type","title","status","code","traceId"],"properties":{"type":{"type":"string"},"title":{"type":"string"},"status":{"type":"integer"},"code":{"type":"string"},"traceId":{"type":"string"}}};

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
if((((((data.type === undefined) && (missing0 = "type")) || ((data.title === undefined) && (missing0 = "title"))) || ((data.status === undefined) && (missing0 = "status"))) || ((data.code === undefined) && (missing0 = "code"))) || ((data.traceId === undefined) && (missing0 = "traceId"))){
validate67.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "type") || (key0 === "title")) || (key0 === "status")) || (key0 === "code")) || (key0 === "traceId"))){
validate67.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.type !== undefined){
const _errs2 = errors;
if(typeof data.type !== "string"){
validate67.errors = [{instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate67.errors = [{instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate67.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
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
validate67.errors = [{instancePath:instancePath+"/code",schemaPath:"#/properties/code/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate67.errors = [{instancePath:instancePath+"/traceId",schemaPath:"#/properties/traceId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate67.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate67.errors = vErrors;
return errors === 0;
}
validate67.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const RaceEvent = validate68;
const schema29 = {"type":"object","additionalProperties":false,"required":["id","name","seasonId","circuitId","round","startsAt","status","laps","revision","timeZone","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"name":{"type":"string"},"seasonId":{"type":"string","format":"uuid"},"circuitId":{"type":"string","format":"uuid"},"round":{"type":"integer"},"startsAt":{"type":"string","format":"date-time"},"status":{"enum":["scheduled","completed","cancelled"]},"laps":{"type":["integer","null"]},"revision":{"type":"integer"},"timeZone":{"type":"string"},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};

function validate68(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate68.evaluated;
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
validate68.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema29.properties, key0))){
validate68.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
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
validate68.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate68.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate68.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate68.errors = [{instancePath:instancePath+"/seasonId",schemaPath:"#/properties/seasonId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate68.errors = [{instancePath:instancePath+"/seasonId",schemaPath:"#/properties/seasonId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate68.errors = [{instancePath:instancePath+"/circuitId",schemaPath:"#/properties/circuitId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate68.errors = [{instancePath:instancePath+"/circuitId",schemaPath:"#/properties/circuitId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate68.errors = [{instancePath:instancePath+"/round",schemaPath:"#/properties/round/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
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
validate68.errors = [{instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate68.errors = [{instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate68.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema29.properties.status.enum},message:"must be equal to one of the allowed values"}];
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
validate68.errors = [{instancePath:instancePath+"/laps",schemaPath:"#/properties/laps/type",keyword:"type",params:{type: schema29.properties.laps.type},message:"must be integer,null"}];
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
validate68.errors = [{instancePath:instancePath+"/revision",schemaPath:"#/properties/revision/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
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
validate68.errors = [{instancePath:instancePath+"/timeZone",schemaPath:"#/properties/timeZone/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate68.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema29.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
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
validate68.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate68.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate68.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate68.errors = vErrors;
return errors === 0;
}
validate68.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const RaceEventDetailV2 = validate70;
const schema30 = {"type":"object","additionalProperties":false,"required":["data","dataMode"],"properties":{"data":{"$ref":"#/$defs/RaceEvent"},"dataMode":{"enum":["mock","licensed"]}}};

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
if(((data.data === undefined) && (missing0 = "data")) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate70.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "data") || (key0 === "dataMode"))){
validate70.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.data !== undefined){
const _errs2 = errors;
if(!(validate68(data.data, {instancePath:instancePath+"/data",parentData:data,parentDataProperty:"data",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate68.errors : vErrors.concat(validate68.errors);
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
validate70.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema30.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
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
validate70.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate70.errors = vErrors;
return errors === 0;
}
validate70.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const RaceEventPageV2 = validate72;
const schema31 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/RaceEvent"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};

function validate72(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate72.evaluated;
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
validate72.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate72.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
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
if(!(validate68(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate68.errors : vErrors.concat(validate68.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate72.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
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
validate72.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema31.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate72.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
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
validate72.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate72.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate72.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema31.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate72.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
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
validate72.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema31.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
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
validate72.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate72.errors = vErrors;
return errors === 0;
}
validate72.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const RaceSession = validate74;
const schema32 = {"type":"object","additionalProperties":false,"required":["id","raceId","kind","sequence","startsAt","endsAt","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"raceId":{"type":"string","format":"uuid"},"kind":{"enum":["practice","qualifying","sprint","race"]},"sequence":{"type":"integer"},"startsAt":{"type":"string","format":"date-time"},"endsAt":{"type":["string","null"],"format":"date-time"},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};

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
if((((((((((data.id === undefined) && (missing0 = "id")) || ((data.raceId === undefined) && (missing0 = "raceId"))) || ((data.kind === undefined) && (missing0 = "kind"))) || ((data.sequence === undefined) && (missing0 = "sequence"))) || ((data.startsAt === undefined) && (missing0 = "startsAt"))) || ((data.endsAt === undefined) && (missing0 = "endsAt"))) || ((data.provenance === undefined) && (missing0 = "provenance"))) || ((data.dataStatus === undefined) && (missing0 = "dataStatus"))) || ((data.updatedAt === undefined) && (missing0 = "updatedAt"))){
validate74.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema32.properties, key0))){
validate74.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
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
validate74.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate74.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate74.errors = [{instancePath:instancePath+"/raceId",schemaPath:"#/properties/raceId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate74.errors = [{instancePath:instancePath+"/raceId",schemaPath:"#/properties/raceId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate74.errors = [{instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/enum",keyword:"enum",params:{allowedValues: schema32.properties.kind.enum},message:"must be equal to one of the allowed values"}];
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
validate74.errors = [{instancePath:instancePath+"/sequence",schemaPath:"#/properties/sequence/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
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
validate74.errors = [{instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate74.errors = [{instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate74.errors = [{instancePath:instancePath+"/endsAt",schemaPath:"#/properties/endsAt/type",keyword:"type",params:{type: schema32.properties.endsAt.type},message:"must be string,null"}];
return false;
}
if(errors === _errs11){
if(errors === _errs11){
if(typeof data5 === "string"){
if(!(formats4.validate(data5))){
validate74.errors = [{instancePath:instancePath+"/endsAt",schemaPath:"#/properties/endsAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
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
validate74.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema32.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
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
validate74.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate74.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate74.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate74.errors = vErrors;
return errors === 0;
}
validate74.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const RaceSessionPageV2 = validate76;
const schema33 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/RaceSession"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};

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
if((((((data.items === undefined) && (missing0 = "items")) || ((data.nextCursor === undefined) && (missing0 = "nextCursor"))) || ((data.snapshotVersion === undefined) && (missing0 = "snapshotVersion"))) || ((data.snapshotId === undefined) && (missing0 = "snapshotId"))) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate76.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate76.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
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
if(!(validate74(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate74.errors : vErrors.concat(validate74.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate76.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
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
validate76.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema33.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate76.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
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
validate76.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate76.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate76.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema33.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate76.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
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
validate76.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema33.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
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
validate76.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate76.errors = vErrors;
return errors === 0;
}
validate76.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const Readiness = validate78;
const schema34 = {"type":"object","additionalProperties":false,"required":["status","phase","dataMode","database","cache"],"properties":{"status":{"enum":["ready","degraded","unavailable"]},"phase":{"const":"2"},"dataMode":{"const":"mock"},"database":{"enum":["up","down"]},"cache":{"enum":["up","down","disabled"]}}};

function validate78(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate78.evaluated;
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
validate78.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "status") || (key0 === "phase")) || (key0 === "dataMode")) || (key0 === "database")) || (key0 === "cache"))){
validate78.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.status !== undefined){
let data0 = data.status;
const _errs2 = errors;
if(!(((data0 === "ready") || (data0 === "degraded")) || (data0 === "unavailable"))){
validate78.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema34.properties.status.enum},message:"must be equal to one of the allowed values"}];
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
validate78.errors = [{instancePath:instancePath+"/phase",schemaPath:"#/properties/phase/const",keyword:"const",params:{allowedValue: "2"},message:"must be equal to constant"}];
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
validate78.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/const",keyword:"const",params:{allowedValue: "mock"},message:"must be equal to constant"}];
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
validate78.errors = [{instancePath:instancePath+"/database",schemaPath:"#/properties/database/enum",keyword:"enum",params:{allowedValues: schema34.properties.database.enum},message:"must be equal to one of the allowed values"}];
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
validate78.errors = [{instancePath:instancePath+"/cache",schemaPath:"#/properties/cache/enum",keyword:"enum",params:{allowedValues: schema34.properties.cache.enum},message:"must be equal to one of the allowed values"}];
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
validate78.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate78.errors = vErrors;
return errors === 0;
}
validate78.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const Season = validate79;
const schema35 = {"type":"object","additionalProperties":false,"required":["id","year","seriesCode","seriesName","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"year":{"type":"integer"},"seriesCode":{"type":"string"},"seriesName":{"type":"string"},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};

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
if((((((((data.id === undefined) && (missing0 = "id")) || ((data.year === undefined) && (missing0 = "year"))) || ((data.seriesCode === undefined) && (missing0 = "seriesCode"))) || ((data.seriesName === undefined) && (missing0 = "seriesName"))) || ((data.provenance === undefined) && (missing0 = "provenance"))) || ((data.dataStatus === undefined) && (missing0 = "dataStatus"))) || ((data.updatedAt === undefined) && (missing0 = "updatedAt"))){
validate79.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((((key0 === "id") || (key0 === "year")) || (key0 === "seriesCode")) || (key0 === "seriesName")) || (key0 === "provenance")) || (key0 === "dataStatus")) || (key0 === "updatedAt"))){
validate79.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
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
validate79.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate79.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate79.errors = [{instancePath:instancePath+"/year",schemaPath:"#/properties/year/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
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
validate79.errors = [{instancePath:instancePath+"/seriesCode",schemaPath:"#/properties/seriesCode/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate79.errors = [{instancePath:instancePath+"/seriesName",schemaPath:"#/properties/seriesName/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate79.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema35.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
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
validate79.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate79.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate79.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate79.errors = vErrors;
return errors === 0;
}
validate79.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const SeasonDetailV2 = validate81;
const schema36 = {"type":"object","additionalProperties":false,"required":["data","dataMode"],"properties":{"data":{"$ref":"#/$defs/Season"},"dataMode":{"enum":["mock","licensed"]}}};

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
if(((data.data === undefined) && (missing0 = "data")) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate81.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "data") || (key0 === "dataMode"))){
validate81.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.data !== undefined){
const _errs2 = errors;
if(!(validate79(data.data, {instancePath:instancePath+"/data",parentData:data,parentDataProperty:"data",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate79.errors : vErrors.concat(validate79.errors);
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
validate81.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema36.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
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
validate81.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate81.errors = vErrors;
return errors === 0;
}
validate81.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const SeasonEntry = validate83;
const schema37 = {"type":"object","additionalProperties":false,"required":["id","seasonId","driverId","teamId","carNumber","fromRound","toRound","driverName","teamName","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"seasonId":{"type":"string","format":"uuid"},"driverId":{"type":"string","format":"uuid"},"teamId":{"type":"string","format":"uuid"},"carNumber":{"type":["integer","null"]},"fromRound":{"type":"integer"},"toRound":{"type":["integer","null"]},"driverName":{"type":"string"},"teamName":{"type":"string"},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};

function validate83(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate83.evaluated;
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
validate83.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema37.properties, key0))){
validate83.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
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
validate83.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate83.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate83.errors = [{instancePath:instancePath+"/seasonId",schemaPath:"#/properties/seasonId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate83.errors = [{instancePath:instancePath+"/seasonId",schemaPath:"#/properties/seasonId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate83.errors = [{instancePath:instancePath+"/driverId",schemaPath:"#/properties/driverId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate83.errors = [{instancePath:instancePath+"/driverId",schemaPath:"#/properties/driverId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate83.errors = [{instancePath:instancePath+"/teamId",schemaPath:"#/properties/teamId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate83.errors = [{instancePath:instancePath+"/teamId",schemaPath:"#/properties/teamId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate83.errors = [{instancePath:instancePath+"/carNumber",schemaPath:"#/properties/carNumber/type",keyword:"type",params:{type: schema37.properties.carNumber.type},message:"must be integer,null"}];
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
validate83.errors = [{instancePath:instancePath+"/fromRound",schemaPath:"#/properties/fromRound/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
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
validate83.errors = [{instancePath:instancePath+"/toRound",schemaPath:"#/properties/toRound/type",keyword:"type",params:{type: schema37.properties.toRound.type},message:"must be integer,null"}];
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
validate83.errors = [{instancePath:instancePath+"/driverName",schemaPath:"#/properties/driverName/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate83.errors = [{instancePath:instancePath+"/teamName",schemaPath:"#/properties/teamName/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate83.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema37.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
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
validate83.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate83.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate83.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate83.errors = vErrors;
return errors === 0;
}
validate83.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const SeasonEntryPageV2 = validate85;
const schema38 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/SeasonEntry"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};

function validate85(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate85.evaluated;
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
validate85.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate85.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
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
if(!(validate83(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate83.errors : vErrors.concat(validate83.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate85.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
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
validate85.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema38.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate85.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
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
validate85.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate85.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate85.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema38.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate85.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
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
validate85.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema38.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
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
validate85.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate85.errors = vErrors;
return errors === 0;
}
validate85.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const SeasonPageV2 = validate87;
const schema39 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/Season"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};

function validate87(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate87.evaluated;
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
validate87.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate87.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
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
if(!(validate79(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate79.errors : vErrors.concat(validate79.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate87.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
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
validate87.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema39.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate87.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
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
validate87.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate87.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate87.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema39.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate87.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
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
validate87.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema39.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
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
validate87.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate87.errors = vErrors;
return errors === 0;
}
validate87.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const SessionResult = validate89;
const schema40 = {"type":"object","additionalProperties":false,"required":["id","sessionId","raceId","driverId","teamId","driverName","teamName","position","resultStatus","points","elapsedMs","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"sessionId":{"type":"string","format":"uuid"},"raceId":{"type":"string","format":"uuid"},"driverId":{"type":"string","format":"uuid"},"teamId":{"type":"string","format":"uuid"},"driverName":{"type":"string"},"teamName":{"type":"string"},"position":{"type":["integer","null"]},"resultStatus":{"enum":["classified","dnf","dns","dsq"]},"points":{"type":"string","pattern":"^-?[0-9]+(?:\\.[0-9]{1,3})?$"},"elapsedMs":{"type":["integer","null"]},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};

function validate89(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate89.evaluated;
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
validate89.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema40.properties, key0))){
validate89.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
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
validate89.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate89.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate89.errors = [{instancePath:instancePath+"/sessionId",schemaPath:"#/properties/sessionId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate89.errors = [{instancePath:instancePath+"/sessionId",schemaPath:"#/properties/sessionId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate89.errors = [{instancePath:instancePath+"/raceId",schemaPath:"#/properties/raceId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate89.errors = [{instancePath:instancePath+"/raceId",schemaPath:"#/properties/raceId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate89.errors = [{instancePath:instancePath+"/driverId",schemaPath:"#/properties/driverId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate89.errors = [{instancePath:instancePath+"/driverId",schemaPath:"#/properties/driverId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate89.errors = [{instancePath:instancePath+"/teamId",schemaPath:"#/properties/teamId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate89.errors = [{instancePath:instancePath+"/teamId",schemaPath:"#/properties/teamId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate89.errors = [{instancePath:instancePath+"/driverName",schemaPath:"#/properties/driverName/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate89.errors = [{instancePath:instancePath+"/teamName",schemaPath:"#/properties/teamName/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate89.errors = [{instancePath:instancePath+"/position",schemaPath:"#/properties/position/type",keyword:"type",params:{type: schema40.properties.position.type},message:"must be integer,null"}];
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
validate89.errors = [{instancePath:instancePath+"/resultStatus",schemaPath:"#/properties/resultStatus/enum",keyword:"enum",params:{allowedValues: schema40.properties.resultStatus.enum},message:"must be equal to one of the allowed values"}];
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
validate89.errors = [{instancePath:instancePath+"/points",schemaPath:"#/properties/points/pattern",keyword:"pattern",params:{pattern: "^-?[0-9]+(?:\\.[0-9]{1,3})?$"},message:"must match pattern \""+"^-?[0-9]+(?:\\.[0-9]{1,3})?$"+"\""}];
return false;
}
}
else {
validate89.errors = [{instancePath:instancePath+"/points",schemaPath:"#/properties/points/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate89.errors = [{instancePath:instancePath+"/elapsedMs",schemaPath:"#/properties/elapsedMs/type",keyword:"type",params:{type: schema40.properties.elapsedMs.type},message:"must be integer,null"}];
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
validate89.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema40.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
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
validate89.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate89.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate89.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate89.errors = vErrors;
return errors === 0;
}
validate89.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const SessionResultPageV2 = validate91;
const schema41 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/SessionResult"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};

function validate91(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate91.evaluated;
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
validate91.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate91.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
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
if(!(validate89(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate89.errors : vErrors.concat(validate89.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate91.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
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
validate91.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema41.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate91.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
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
validate91.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate91.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate91.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema41.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate91.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
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
validate91.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema41.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
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
validate91.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate91.errors = vErrors;
return errors === 0;
}
validate91.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const StandingRow = validate93;
const schema42 = {"type":"object","additionalProperties":false,"required":["id","snapshotId","seasonId","afterRaceId","capturedAt","snapshotRevision","position","points","wins","name","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"snapshotId":{"type":"string","format":"uuid"},"seasonId":{"type":"string","format":"uuid"},"afterRaceId":{"type":["string","null"],"format":"uuid"},"capturedAt":{"type":"string","format":"date-time"},"snapshotRevision":{"type":"integer"},"position":{"type":"integer"},"points":{"type":"string","pattern":"^-?[0-9]+(?:\\.[0-9]{1,3})?$"},"wins":{"type":"integer"},"name":{"type":"string"},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};

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
if((((((((((((((data.id === undefined) && (missing0 = "id")) || ((data.snapshotId === undefined) && (missing0 = "snapshotId"))) || ((data.seasonId === undefined) && (missing0 = "seasonId"))) || ((data.afterRaceId === undefined) && (missing0 = "afterRaceId"))) || ((data.capturedAt === undefined) && (missing0 = "capturedAt"))) || ((data.snapshotRevision === undefined) && (missing0 = "snapshotRevision"))) || ((data.position === undefined) && (missing0 = "position"))) || ((data.points === undefined) && (missing0 = "points"))) || ((data.wins === undefined) && (missing0 = "wins"))) || ((data.name === undefined) && (missing0 = "name"))) || ((data.provenance === undefined) && (missing0 = "provenance"))) || ((data.dataStatus === undefined) && (missing0 = "dataStatus"))) || ((data.updatedAt === undefined) && (missing0 = "updatedAt"))){
validate93.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(func1.call(schema42.properties, key0))){
validate93.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
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
validate93.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate93.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate93.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate93.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate93.errors = [{instancePath:instancePath+"/seasonId",schemaPath:"#/properties/seasonId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate93.errors = [{instancePath:instancePath+"/seasonId",schemaPath:"#/properties/seasonId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate93.errors = [{instancePath:instancePath+"/afterRaceId",schemaPath:"#/properties/afterRaceId/type",keyword:"type",params:{type: schema42.properties.afterRaceId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs8){
if(errors === _errs8){
if(typeof data3 === "string"){
if(!(formats0.test(data3))){
validate93.errors = [{instancePath:instancePath+"/afterRaceId",schemaPath:"#/properties/afterRaceId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
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
validate93.errors = [{instancePath:instancePath+"/capturedAt",schemaPath:"#/properties/capturedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate93.errors = [{instancePath:instancePath+"/capturedAt",schemaPath:"#/properties/capturedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate93.errors = [{instancePath:instancePath+"/snapshotRevision",schemaPath:"#/properties/snapshotRevision/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
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
validate93.errors = [{instancePath:instancePath+"/position",schemaPath:"#/properties/position/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
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
validate93.errors = [{instancePath:instancePath+"/points",schemaPath:"#/properties/points/pattern",keyword:"pattern",params:{pattern: "^-?[0-9]+(?:\\.[0-9]{1,3})?$"},message:"must match pattern \""+"^-?[0-9]+(?:\\.[0-9]{1,3})?$"+"\""}];
return false;
}
}
else {
validate93.errors = [{instancePath:instancePath+"/points",schemaPath:"#/properties/points/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate93.errors = [{instancePath:instancePath+"/wins",schemaPath:"#/properties/wins/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
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
validate93.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate93.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema42.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
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
validate93.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate93.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate93.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate93.errors = vErrors;
return errors === 0;
}
validate93.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const StandingRowPageV2 = validate95;
const schema43 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/StandingRow"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};

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
if((((((data.items === undefined) && (missing0 = "items")) || ((data.nextCursor === undefined) && (missing0 = "nextCursor"))) || ((data.snapshotVersion === undefined) && (missing0 = "snapshotVersion"))) || ((data.snapshotId === undefined) && (missing0 = "snapshotId"))) || ((data.dataMode === undefined) && (missing0 = "dataMode"))){
validate95.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate95.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
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
if(!(validate93(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate93.errors : vErrors.concat(validate93.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate95.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
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
validate95.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema43.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate95.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
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
validate95.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate95.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate95.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema43.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate95.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
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
validate95.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema43.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
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
validate95.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate95.errors = vErrors;
return errors === 0;
}
validate95.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const Team = validate97;
const schema44 = {"type":"object","additionalProperties":false,"required":["id","name","countryCode","provenance","dataStatus","updatedAt"],"properties":{"id":{"type":"string","format":"uuid"},"name":{"type":"string"},"countryCode":{"type":["string","null"]},"provenance":{"$ref":"#/$defs/Phase2Provenance"},"dataStatus":{"enum":["synthetic","current","stale","corrected"]},"updatedAt":{"type":"string","format":"date-time"}}};

function validate97(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate97.evaluated;
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
validate97.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((((key0 === "id") || (key0 === "name")) || (key0 === "countryCode")) || (key0 === "provenance")) || (key0 === "dataStatus")) || (key0 === "updatedAt"))){
validate97.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
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
validate97.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
return false;
}
}
else {
validate97.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate97.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate97.errors = [{instancePath:instancePath+"/countryCode",schemaPath:"#/properties/countryCode/type",keyword:"type",params:{type: schema44.properties.countryCode.type},message:"must be string,null"}];
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
validate97.errors = [{instancePath:instancePath+"/dataStatus",schemaPath:"#/properties/dataStatus/enum",keyword:"enum",params:{allowedValues: schema44.properties.dataStatus.enum},message:"must be equal to one of the allowed values"}];
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
validate97.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""}];
return false;
}
}
else {
validate97.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate97.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate97.errors = vErrors;
return errors === 0;
}
validate97.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const TeamDetailV2 = validate99;
const schema45 = {"type":"object","additionalProperties":false,"required":["data","dataMode"],"properties":{"data":{"$ref":"#/$defs/Team"},"dataMode":{"enum":["mock","licensed"]}}};

function validate99(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate99.evaluated;
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
validate99.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "data") || (key0 === "dataMode"))){
validate99.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.data !== undefined){
const _errs2 = errors;
if(!(validate97(data.data, {instancePath:instancePath+"/data",parentData:data,parentDataProperty:"data",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate97.errors : vErrors.concat(validate97.errors);
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
validate99.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema45.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
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
validate99.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate99.errors = vErrors;
return errors === 0;
}
validate99.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const TeamPageV2 = validate101;
const schema46 = {"type":"object","additionalProperties":false,"required":["items","nextCursor","snapshotVersion","snapshotId","dataMode"],"properties":{"items":{"type":"array","items":{"$ref":"#/$defs/Team"}},"nextCursor":{"type":["string","null"],"maxLength":512},"snapshotVersion":{"type":"string","pattern":"^[a-f0-9]{64}$"},"snapshotId":{"type":["string","null"],"format":"uuid"},"dataMode":{"enum":["mock","licensed","mixed","empty"]}}};

function validate101(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate101.evaluated;
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
validate101.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "items") || (key0 === "nextCursor")) || (key0 === "snapshotVersion")) || (key0 === "snapshotId")) || (key0 === "dataMode"))){
validate101.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
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
if(!(validate97(data0[i0], {instancePath:instancePath+"/items/" + i0,parentData:data0,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate97.errors : vErrors.concat(validate97.errors);
errors = vErrors.length;
}
var valid1 = _errs4 === errors;
if(!valid1){
break;
}
}
}
else {
validate101.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];
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
validate101.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/type",keyword:"type",params:{type: schema46.properties.nextCursor.type},message:"must be string,null"}];
return false;
}
if(errors === _errs5){
if(typeof data2 === "string"){
if(func2(data2) > 512){
validate101.errors = [{instancePath:instancePath+"/nextCursor",schemaPath:"#/properties/nextCursor/maxLength",keyword:"maxLength",params:{limit: 512},message:"must NOT have more than 512 characters"}];
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
validate101.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/pattern",keyword:"pattern",params:{pattern: "^[a-f0-9]{64}$"},message:"must match pattern \""+"^[a-f0-9]{64}$"+"\""}];
return false;
}
}
else {
validate101.errors = [{instancePath:instancePath+"/snapshotVersion",schemaPath:"#/properties/snapshotVersion/type",keyword:"type",params:{type: "string"},message:"must be string"}];
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
validate101.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: schema46.properties.snapshotId.type},message:"must be string,null"}];
return false;
}
if(errors === _errs9){
if(errors === _errs9){
if(typeof data4 === "string"){
if(!(formats0.test(data4))){
validate101.errors = [{instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/format",keyword:"format",params:{format: "uuid"},message:"must match format \""+"uuid"+"\""}];
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
validate101.errors = [{instancePath:instancePath+"/dataMode",schemaPath:"#/properties/dataMode/enum",keyword:"enum",params:{allowedValues: schema46.properties.dataMode.enum},message:"must be equal to one of the allowed values"}];
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
validate101.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate101.errors = vErrors;
return errors === 0;
}
validate101.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};
