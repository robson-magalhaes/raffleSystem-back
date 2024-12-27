export default (str:string) => {
    const cleanedStr = str.replace(/[^a-zA-Z0-9 ]/g, '');
    const trimmedStr = str.trim();
    const capitalizedStr = trimmedStr.charAt(0).toUpperCase() + trimmedStr.slice(1).toLowerCase();

    return capitalizedStr;
}
