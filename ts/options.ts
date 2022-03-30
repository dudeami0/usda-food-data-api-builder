import { program } from "commander";

program
    .version("1.0.2", "-v, --version")
    .usage("[OPTIONS]...")
    .option("--no-link", "Disables linking documents")
    .option("--verbose", "Logging", false)
    .option("--no-batch", "Disables document batching", true)
    .parse(process.argv);

export default program.opts();
