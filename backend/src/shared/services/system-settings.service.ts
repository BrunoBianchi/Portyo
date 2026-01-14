import { AppDataSource } from "../../database/datasource";
import { SystemSettings } from "../../entities/system-settings.entity";

export const getSystemSetting = async (key: string) => {
    const repo = AppDataSource.getRepository(SystemSettings);
    const setting = await repo.findOne({ where: { key } });
    return setting?.value || null;
}

export const updateSystemSetting = async (key: string, value: any) => {
    const repo = AppDataSource.getRepository(SystemSettings);
    let setting = await repo.findOne({ where: { key } });
    
    if (!setting) {
        setting = new SystemSettings();
        setting.key = key;
    }
    
    setting.value = value;
    await repo.save(setting);
    return setting;
}
