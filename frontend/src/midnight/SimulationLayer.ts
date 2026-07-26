export class SimulationLayer {
  public isSimulationMode(): boolean {
    return true; // Transparent default for local enclave simulation
  }

  public getSimulationNotice(): string {
    return "Simulation Mode — Connected to Client Local Enclave";
  }
}
