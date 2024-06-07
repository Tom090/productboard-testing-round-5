import { OperationHandlerSetup } from '@trayio/cdk-dsl/connector/operation/OperationHandlerSetup';
import { ProductboardTestingRound5Auth } from '../ProductboardTestingRound5Auth';
import { ListAllNotesInput } from './input';
import { ListAllNotesOutput } from './output';
import { globalConfigHttp } from '../GlobalConfig';
import { OperationHandlerResult, OperationHandlerError } from '@trayio/cdk-dsl/connector/operation/OperationHandler';

export const listAllNotesHandler = OperationHandlerSetup.configureHandler<
	ProductboardTestingRound5Auth,
	ListAllNotesInput,
	ListAllNotesOutput
>((handler) =>
	handler.withGlobalConfiguration(globalConfigHttp).usingHttp((http) =>
		http
			.get('/notes')
			.handleRequest((ctx, input, request) =>
				request
					.addQueryString('term', input.term)
					.addQueryString('featureId', input.featureId || '')
					.addQueryString('companyId', input.companyId || '')
					.addQueryString('pageCursor', input.pageCursor || '')
					.withoutBody()
			)
			.handleResponse((ctx, input, response) =>
				response
					.withErrorHandling(() => {
						if (response.getStatusCode() === 422) {
							return OperationHandlerResult.failure(
								OperationHandlerError.userInputError('Page Cursor has expired')
							);
						}
						return OperationHandlerResult.failure(
							OperationHandlerError.apiError(`API error: ${response.getStatusCode()}`)
						);
					})
					.parseWithBodyAsJson()
			)
	)
);