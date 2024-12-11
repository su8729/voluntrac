import { Loader } from "@googlemaps/js-api-loader";

const loader = new Loader({
    apiKey: "AIzaSyA5fWQmUI5LZAY-oewojNSTNsCeLVgXfvI",
    version: "weekly",
    libraries: ["places"], 
});

export default loader;
