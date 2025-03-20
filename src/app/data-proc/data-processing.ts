import * as d3 from 'd3';
import { AttackData } from '../data-types/types';



export function bonjoubonjou(){
    console.log("type shit")

}

export async function getAttacks(csvUrl: string): Promise<AttackData[]> {
    try {
        const rawData = await d3.dsv(";", csvUrl);

        const processedData: AttackData[] = rawData.map((d) => ({
            year: +d["iyear"],        
            month: +d["imonth"],       
            day: +d["iday"],         
            state: d["provstate"] ?? "Unknown",
            city: d["city"] ?? "Unknown",     
        }));
  
        console.log("list of attacks - where and when:", processedData);
        return processedData;
  
    } catch (error) {
        console.error("Error loading CSV:", error);
        return [];
    }
  }