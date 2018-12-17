* \+ в мастере есть тесты, можно посмотреть больше примеров

* MachineDescription - описание автомата
* MachineBox хранит описание, сырые состояние и контекст автомата, операции для изменения автомата
* клиенту возвращается только StateMachine с операциями получения стейта, контекста, инициации перехода, проверки, что автомат в консистентном состоянии
* сырые state и context изолируются, единственный способ изменения  в клиентском коде - useState.setState, useContext.setContext
* useState и useContext для работы требуется получение текущего объекта автомата, который должен определяться динамически
* текущий объект автомата контролируется транзакцией, которая создается при вызове setState и transition
* отсюда ограничение: useState и useContext могут вызываться только в actions / services (хорошо бы на такое написать линтер)