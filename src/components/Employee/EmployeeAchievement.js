// useEmployeeAchievements.js - Corrected Hook based on your Achievement schema
import { useState, useEffect } from "react";
import { getEmployeeAchievement } from "../Acheivements/AchievementsApi.js";

export const useEmployeeAchievements = (employees, onlyApproved = true) => {
    const [employeeAchievements, setEmployeeAchievements] = useState({});
    const [loading, setLoading] = useState(false);

    const fetchAchievementsForEmployee = async (employeeId) => {
        try {
            const result = await getEmployeeAchievement(employeeId);

            console.log("🔎 Raw achievements API response for employee:", employeeId, result);

            if (result.success) {
                let achievementsList = [];

                // Handle your actual API response structure
                if (result.achievements && Array.isArray(result.achievements)) {
                    achievementsList = result.achievements;
                } else if (result.data && Array.isArray(result.data)) {
                    achievementsList = result.data;
                } else if (result.data && result.data.achievements && Array.isArray(result.data.achievements)) {
                    achievementsList = result.data.achievements;
                } else if (result.data && typeof result.data === 'object') {
                    // If data is a single object, wrap it in an array
                    achievementsList = [result.data];
                } else {
                    console.warn(`⚠️ Unexpected data structure for employee ${employeeId}:`, result);
                    return [];
                }

                console.log("📋 All achievements (before filter):", achievementsList);

                // Filter by approval status if needed
                if (onlyApproved) {
                    achievementsList = achievementsList.filter(achievement =>
                        achievement && achievement.isApproved === true
                    );
                    console.log("✅ Approved achievements after filter:", achievementsList);
                }

                // Extract achievement information based on your schema
                const achievementDescriptions = [];
                achievementsList.forEach(achievement => {
                    if (achievement) {
                        // Based on your schema, create meaningful descriptions
                        let description = '';

                        if (achievement.achievementType) {
                            description = achievement.achievementType;

                            // Add achievement reason if available
                            // if (achievement.achievementReason) {
                            //     description += ` - ${achievement.achievementReason}`;
                            // }

                            // Add benefit if available
                            if (achievement.benefit) {
                                description += ` (${achievement.benefit})`;
                            }

                            // Add amount if available
                            if (achievement.amount) {
                                description += ` - Amount: ${achievement.amount}`;
                            }
                        } else {
                            // Fallback description
                            // description = achievement.achievementReason ||
                            //     achievement.benefit ||
                            //     'Achievement';

                            if (achievement.amount) {
                                description += ` - ${achievement.amount}`;
                            }
                        }

                        // Add date if available
                        // if (achievement.date) {
                        //     const date = new Date(achievement.date).toLocaleDateString();
                        //     description += ` (${date})`;
                        // }

                        if (description.trim()) {
                            achievementDescriptions.push(description.trim());
                        }
                    }
                });

                console.log("🏆 Final achievement descriptions:", achievementDescriptions);
                return achievementDescriptions;
            }
            return [];
        } catch (error) {
            console.error(`❌ Error fetching achievements for employee ${employeeId}:`, error);
            return [];
        }
    };

    const fetchAllEmployeeAchievements = async () => {
        if (!employees || employees.length === 0) return;

        setLoading(true);
        const achievementsMap = {};

        try {
            // Process employees in smaller batches to avoid API overload
            const batchSize = 3; // Even smaller batch size

            for (let i = 0; i < employees.length; i += batchSize) {
                const batch = employees.slice(i, i + batchSize);
                const promises = batch.map(async (employee) => {
                    if (employee && employee._id) {
                        const achievements = await fetchAchievementsForEmployee(employee._id);
                        return { employeeId: employee._id, achievements };
                    }
                    return { employeeId: null, achievements: [] };
                });

                const results = await Promise.all(promises);

                // Process results
                results.forEach(({ employeeId, achievements }) => {
                    if (employeeId) {
                        achievementsMap[employeeId] = achievements;
                    }
                });

                // Add delay between batches to be gentle on the API
                if (i + batchSize < employees.length) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

            console.log("📦 Final achievements map:", achievementsMap);
            setEmployeeAchievements(achievementsMap);
        } catch (error) {
            console.error("❌ Error fetching employee achievements:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (employees && employees.length > 0) {
            console.log("🚀 Starting to fetch achievements for employees:", employees.length);
            fetchAllEmployeeAchievements();
        } else {
            console.log("📭 No employees provided, clearing achievements");
            setEmployeeAchievements({});
        }
    }, [employees, onlyApproved]);

    const getEmployeeAchievements = (employeeId) => {
        return employeeAchievements[employeeId] || [];
    };

    const getEmployeeAchievementsString = (employeeId) => {
        const achievements = getEmployeeAchievements(employeeId);
        if (achievements.length === 0) {
            return "No achievements";
        }
        // Limit the display to avoid very long strings
        if (achievements.length > 3) {
            return `${achievements.slice(0, 3).join(", ")} (+${achievements.length - 3} more)`;
        }
        return achievements.join(", ");
    };

    const getEmployeeAchievementCount = (employeeId) => {
        return getEmployeeAchievements(employeeId).length;
    };

    const getEmployeeAchievementsShort = (employeeId) => {
        const achievements = getEmployeeAchievements(employeeId);
        if (achievements.length === 0) {
            return "None";
        }
        return `${achievements.length} achievement${achievements.length > 1 ? 's' : ''}`;
    };

    return {
        employeeAchievements,
        loading,
        getEmployeeAchievements,
        getEmployeeAchievementsString,
        getEmployeeAchievementCount,
        getEmployeeAchievementsShort,
        refreshEmployeeAchievements: fetchAllEmployeeAchievements,
    };
};