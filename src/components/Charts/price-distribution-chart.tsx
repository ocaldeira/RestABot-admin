"use client";

import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface PriceDistributionChartProps {
    data: Record<string, number>;
}

export function PriceDistributionChart({ data }: PriceDistributionChartProps) {
    // Sort or order specific keys? $, $$, $$$, $$$$
    // The API returns unknown keys, but usually $, $$, etc.
    // Let's iterate over keys from the object
    const labels = Object.keys(data);
    const series = Object.values(data);

    const options: ApexOptions = {
        chart: {
            type: "donut",
        },
        labels: labels,
        colors: ["#10B981", "#375E83", "#259AE6", "#FFA70B"],
        legend: {
            position: "bottom",
            fontFamily: "Satoshi",
            fontWeight: 500,
            fontSize: "14px",
            markers: {
            },
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "65%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            showAlways: true,
                            label: "Restaurants",
                            fontSize: "16px",
                            fontFamily: "Satoshi",
                            fontWeight: 400,
                            color: "#333",
                            formatter: function (w) {
                                // Sum of all series
                                return w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0);
                            }
                        }
                    }
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        responsive: [
            {
                breakpoint: 2600,
                options: {
                    chart: {
                        width: 380,
                    },
                },
            },
            {
                breakpoint: 640,
                options: {
                    chart: {
                        width: 200,
                    },
                },
            },
        ],
        title: {
            text: "Price Distribution",
            style: {
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1C2434", // text-black
            },
        },
    };

    return (
        <div className="col-span-12 rounded-[10px] bg-white px-7.5 py-6 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-5">
            <div className="mb-2">
            </div>
            <div className="mb-2">
                <div id="chartThree" className="mx-auto flex justify-center">
                    <ReactApexChart options={options} series={series} type="donut" />
                </div>
            </div>
        </div>
    );
}
