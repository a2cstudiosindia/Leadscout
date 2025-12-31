"use server";

import { Scanner } from "@/lib/scanner";
import { DiscoveryService } from "@/lib/discovery/service";

export async function runAudit(url: string) {
    const scanner = new Scanner();
    try {
        const report = await scanner.scan(url);
        await scanner.close();
        return { success: true, report };
    } catch (error) {
        console.error("Audit failed:", error);
        await scanner.close();
        return { success: false, error: "Failed to scan website" };
    }
}

export async function findLeads(query: string) {
    const service = new DiscoveryService();
    try {
        const result = await service.search(query);
        return { success: true, results: result.results };
    } catch (error) {
        console.error("Discovery failed:", error);
        return { success: false, error: "Failed to find leads", results: [] };
    }
}
